import { describe, expect, it } from "vitest";
import { chatJSON, parseModelOutput } from "./llm";

const config = {
  baseUrl: "https://example.com/v1",
  apiKey: "secret",
  model: "test-model",
};

function debug() {}

interface TitlesResult {
  titles: string[];
}

function isTitlesResult(value: unknown): value is TitlesResult {
  return !!value && typeof value === "object" && Array.isArray((value as TitlesResult).titles);
}

function fakeRequest(content: string) {
  const calls: any[] = [];
  const request = async (method: string, url: string, options: any) => {
    calls.push({ method, url, options });
    return { response: JSON.stringify({ choices: [{ message: { content } }] }) };
  };
  return { request, calls };
}

describe("parseModelOutput", () => {
  it("parses plain JSON", () => {
    expect(parseModelOutput(`{"titles":["A"]}`)).toEqual({ titles: ["A"] });
  });

  it("strips markdown fences", () => {
    expect(parseModelOutput("```json\n{\"titles\":[\"A\"]}\n```")).toEqual({ titles: ["A"] });
  });

  it("extracts JSON surrounded by prose", () => {
    expect(parseModelOutput(`Sure! {"titles":["A"]} Hope it helps.`)).toEqual({ titles: ["A"] });
  });

  it("returns raw text without JSON", () => {
    expect(parseModelOutput("  ok  ")).toBe("ok");
  });

  it("returns undefined for non-string input", () => {
    expect(parseModelOutput(undefined)).toBeUndefined();
  });
});

describe("chatJSON", () => {
  it("returns the validated result", async () => {
    const { request, calls } = fakeRequest(`{"titles":["East Asian dust"]}`);
    const result = await chatJSON<TitlesResult>({
      config,
      system: "s1",
      user: { titles: ["east asian dust"] },
      validate: isTitlesResult,
      debug,
      request,
    });

    expect(result).toEqual({ titles: ["East Asian dust"] });
    expect(calls[0].url).toBe("https://example.com/v1/chat/completions");
    expect(calls[0].options.headers.Authorization).toBe("Bearer secret");
    expect(calls[0].options.timeout).toBe(120_000);
    expect(JSON.parse(calls[0].options.body)).toMatchObject({
      model: "test-model",
      temperature: 0,
      stream: false,
      messages: [
        { role: "system", content: "s1" },
        { role: "user", content: `{"titles":["east asian dust"]}` },
      ],
    });
  });

  it("returns undefined when validation fails", async () => {
    const { request } = fakeRequest("Sorry, I cannot help with that.");
    const result = await chatJSON<TitlesResult>({
      config,
      system: "s2",
      user: {},
      validate: isTitlesResult,
      debug,
      request,
    });

    expect(result).toBeUndefined();
  });

  it("returns undefined when the request fails", async () => {
    const request = async () => {
      throw new Error("network down");
    };
    const result = await chatJSON<TitlesResult>({
      config,
      system: "s3",
      user: {},
      debug,
      request,
    });

    expect(result).toBeUndefined();
  });

  it("caches identical requests", async () => {
    const { request, calls } = fakeRequest(`{"titles":["A"]}`);
    const options = {
      config,
      system: "s4",
      user: { titles: ["a"] },
      validate: isTitlesResult,
      debug,
      request,
    };

    await chatJSON<TitlesResult>(options);
    await chatJSON<TitlesResult>(options);

    expect(calls).toHaveLength(1);
  });
});
