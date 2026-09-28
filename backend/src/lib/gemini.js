
/**
 * Minimal Gemini client for the assistant (SRS FR-4).
 *
 * Written against the REST API directly rather than pulling in an SDK: we use
 * exactly one endpoint, and the SDK would be a large dependency for it.
 *
 * Three behaviours here exist because the API actually does this:
 *
 *  · `gemini-flash-latest` returns 503 "high demand" fairly often, so the
 *    client walks a fallback chain rather than failing the request.
 *  · Newer models spend tokens on internal reasoning before answering. With a
 *    small `maxOutputTokens` the whole budget goes to thinking and the reply
 *    comes back empty with finishReason MAX_TOKENS — so the budget is generous
 *    and thinking is switched off for these short factual answers.
 *  · Not every model accepts `thinkingConfig`; the lite variants reject it
 *    with a 400. On that specific failure the call is retried without it.
 */

const BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Tried in order. The first to answer wins. */
const MODEL_CHAIN = [
  process.env.GEMINI_MODEL || "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-flash-lite-latest",
];

/** Whether the assistant is configured at all. */
export function isAssistantEnabled() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function callModel(
  model,
  systemInstruction,
  history,
  withThinking,
  maxOutputTokens,
) {
  const generationConfig = {
    maxOutputTokens,
    temperature: 0.3,
    topP: 0.9,
  };
  if (!withThinking) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  const response = await fetch(`${BASE}/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: history.map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
      generationConfig,
      // Let the model discuss fandom media (violence in fiction, etc.) without
      // tripping filters on ordinary questions about anime and games.
      safetySettings: [
        "HARM_CATEGORY_HARASSMENT",
        "HARM_CATEGORY_HATE_SPEECH",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "HARM_CATEGORY_DANGEROUS_CONTENT",
      ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" })),
    }),
    // Short enough that a stalled model still leaves room to try the next one
    // in the chain before the reader gives up on the widget.
    signal: AbortSignal.timeout(14_000),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      status: response.status,
      error: data.error?.message ?? `HTTP ${response.status}`,
    };
  }

  const candidate = data.candidates?.[0];

  // Join every non-thought part. A reply can arrive split across parts, and
  // reading only the first one silently returns a fragment.
  const text = (candidate?.content?.parts ?? [])
    .filter((part) => !part.thought && part.text)
    .map((part) => part.text)
    .join("")
    .trim();

  if (!text) {
    return {
      status: 200,
      error: `No answer returned (${candidate?.finishReason ?? "empty response"})`,
    };
  }

  // MAX_TOKENS means the model was cut off mid-sentence. Report it so the
  // caller can retry with a bigger budget instead of showing half an answer.
  return {
    status: 200,
    text,
    truncated: candidate?.finishReason === "MAX_TOKENS",
  };
}

/** Sends a conversation and returns the assistant's reply. */
export async function generateReply(systemInstruction, history) {
  if (!isAssistantEnabled()) {
    return {
      ok: false,
      error: "The assistant isn't configured on this deployment.",
    };
  }

  let lastError = "The assistant is unavailable right now.";

  for (const model of MODEL_CHAIN) {
    for (const withThinking of [false, true]) {
      try {
        let result = await callModel(
          model,
          systemInstruction,
          history,
          withThinking,
          2000,
        );

        // Cut off mid-sentence: one retry with a much larger budget rather
        // than handing the reader a fragment.
        if (result.truncated) {
          const retried = await callModel(
            model,
            systemInstruction,
            history,
            withThinking,
            6000,
          );
          if (retried.text) result = retried;
        }

        if (result.text) return { ok: true, text: result.text, model };

        lastError = result.error ?? lastError;

        // A 400 here usually means this model rejected `thinkingConfig`; the
        // second pass retries without it. Anything else: move to the next model.
        if (result.status === 400 && !withThinking) continue;
        break;
      } catch (error) {
        lastError = error.message;
        break;
      }
    }
  }

  console.error("[gemini] all models failed:", lastError);
  return { ok: false, error: lastError };
}
