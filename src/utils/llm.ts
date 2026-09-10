import { createLogger } from "./logger";
import { getPref } from "./prefs";

const logger = createLogger("llm");

/** 请求超时，应小于 runner 对单条规则的 60s 上限 */
const TIMEOUT = 30_000;

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

  const baseUrl = (getPref("llm.baseUrl") || "").replace(/\/+$/, "");
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

/** Test the connection with one minimal request */
export async function testLlmConnection(request?: LlmRequest): Promise<boolean> {
  const config = getLlmConfig();
  if (!config)
    return false;

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
