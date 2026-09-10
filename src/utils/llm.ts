import { createLogger } from "./logger";
import { getPref } from "./prefs";

const logger = createLogger("llm");

/**
 * 请求超时。LLM 目前只用于 prepare 阶段，不受 runner 对单条规则的 60s 上限约束；
 * 推理型模型在 20 条的批次上实测约 30s，因此留出充裕余量。
 */
const TIMEOUT = 120_000;

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export type LlmRequest = (
  method: string,
  url: string,
  options: { body?: string; headers?: Record<string, string>; timeout?: number },
) => Promise<{ response: string }>;

const _request: LlmRequest = (method, url, options) => Zotero.HTTP.request(method, url, options);

/**
 * 归一化接口地址：容忍结尾斜杠，以及用户直接粘贴的完整 /chat/completions 地址。
 *
 * 带 `/chat/completions` 的地址若照原样再拼一次后缀，请求会 404 并静默回退到本地规则，
 * 用户只会看到「没效果」。
 */
export function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "").replace(/\/chat\/completions$/, "");
}

const cache = new Map<string, unknown>();

/**
 * Read LLM config from prefs.
 *
 * Returns `undefined` when the feature is disabled or the config is incomplete,
 * so callers can fall back to local rules.
 */
export function getLlmConfig(): LlmConfig | undefined {
  if (!getPref("llm.enabled"))
    return undefined;

  const baseUrl = normalizeBaseUrl(getPref("llm.baseUrl") || "");
  const model = getPref("llm.model") || "";
  if (!baseUrl || !model)
    return undefined;

  return {
    baseUrl,
    apiKey: getPref("llm.apiKey") || "",
    model,
  };
}

export function clearLlmCache() {
  cache.clear();
}

export interface LlmChatOptions<T> {
  config: LlmConfig;
  /** System prompt */
  system: string;
  /** Structured input, sent as a JSON string */
  user: unknown;
  /** Validate the model output; the response is discarded if it returns false */
  validate?: (value: unknown) => value is T;
  debug?: (...args: any[]) => void;
  /** Injection point for unit tests */
  request?: LlmRequest;
}

/**
 * Send one OpenAI-compatible chat completion request.
 *
 * Any failure (network, timeout, unparsable or invalid response) resolves to
 * `undefined` instead of throwing, so callers can fall back to local rules.
 */
export async function chatJSON<T>(options: LlmChatOptions<T>): Promise<T | undefined> {
  const { config, system, user, validate, request = _request } = options;
  const debug = options.debug ?? logger.debug;

  const payload = JSON.stringify(user);
  const cacheKey = [config.baseUrl, config.model, system, payload].join("\n");
  if (cache.has(cacheKey))
    return cache.get(cacheKey) as T;

  try {
    const res = await request("POST", `${config.baseUrl}/chat/completions`, {
      headers: {
        "Content-Type": "application/json",
        ...config.apiKey && { Authorization: `Bearer ${config.apiKey}` },
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: payload },
        ],
        temperature: 0,
        stream: false,
      }),
      timeout: TIMEOUT,
    });

    const content = getMessageContent(res.response);
    const value = parseModelOutput(content);
    if (value === undefined) {
      debug("LLM response is not parsable.");
      return undefined;
    }

    if (validate && !validate(value)) {
      debug("LLM response failed validation:", value);
      return undefined;
    }

    cache.set(cacheKey, value);
    return value as T;
  }
  catch (error) {
    debug("LLM request failed:", error);
    return undefined;
  }
}

/**
 * Test the connection with one minimal request.
 *
 * 每次点击都要真的走一次网络，否则按钮只会复述上一次的结果，掩盖配置错误。
 */
export async function testLlmConnection(request?: LlmRequest): Promise<boolean> {
  const config = getLlmConfig();
  if (!config)
    return false;

  clearLlmCache();
  const res = await chatJSON({
    config,
    system: "Reply with a JSON object only.",
    user: { task: `Reply with {"ok": true}` },
    request,
  });

  return res !== undefined;
}

function getMessageContent(response: unknown): unknown {
  const data = typeof response === "string" ? parseModelOutput(response) : response;
  return (data as any)?.choices?.[0]?.message?.content;
}

/**
 * Extract JSON from a model output, tolerating ```json fences and
 * surrounding prose. Returns the trimmed raw text if it contains no JSON.
 */
export function parseModelOutput(text: unknown): unknown {
  if (typeof text !== "string")
    return undefined;

  const stripped = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  if (!stripped)
    return undefined;

  const direct = _tryParse(stripped);
  if (direct !== undefined)
    return direct;

  const start = stripped.search(/[[{]/);
  const end = Math.max(stripped.lastIndexOf("}"), stripped.lastIndexOf("]"));
  if (start >= 0 && end > start) {
    const embedded = _tryParse(stripped.slice(start, end + 1));
    if (embedded !== undefined)
      return embedded;
  }

  return stripped;
}

function _tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  }
  catch {
    return undefined;
  }
}
