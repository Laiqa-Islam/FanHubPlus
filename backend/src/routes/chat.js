import { z } from "zod";

import { connectToDatabase } from "../lib/db.js";
import { ChatbotQuery, FaqEntry } from "../models/index.js";
import { getCurrentUser } from "../lib/dal.js";
import { rateLimit } from "../lib/rate-limit.js";
import { generateReply, isAssistantEnabled } from "../lib/gemini.js";
import {
  buildContext,
  buildSystemInstruction,
  findFaqAnswer,
} from "../lib/assistant.js";

/**
 * The assistant endpoint (SRS FR-4).
 *
 * History is persisted per `sessionId` so the conversation keeps context
 * across turns and page loads, for signed-out visitors as well as members —
 * that is what the SRS means by "chat history stored for context continuity".
 */

const RequestSchema = z.object({
  message: z.string().trim().min(1, "Say something first.").max(1000),
  sessionId: z.string().trim().min(8).max(64),
});

/** How many previous turns to replay as context. */
const HISTORY_TURNS = 8;

export async function POST(request) {
  if (!isAssistantEnabled()) {
    return Response.json(
      { error: "The assistant isn't switched on for this deployment." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { message, sessionId } = parsed.data;

  // Model calls cost money and take seconds, so the limit is deliberately
  // tight and keyed on the conversation rather than the IP.
  const limit = await rateLimit(`chat:${sessionId}`, 15, 300);
  if (!limit.ok) {
    return Response.json(
      {
        error: `That's a lot of questions. Try again in ${limit.retryAfterSeconds}s.`,
      },
      { status: 429 },
    );
  }

  try {
    const user = await getCurrentUser();
    await connectToDatabase();

    // Replay recent turns for continuity.
    const previous = await ChatbotQuery.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(HISTORY_TURNS)
      .lean();

    const history = previous.reverse().flatMap((turn) =>
      turn.response
        ? [
            { role: "user", text: turn.message },
            { role: "model", text: turn.response },
          ]
        : [],
    );

    const { reference, recommendations } = await buildContext(
      message,
      user?.favoriteCategories ?? [],
    );

    const result = await generateReply(
      buildSystemInstruction(reference, Boolean(user)),
      [...history, { role: "user", text: message }],
    );

    if (!result.ok) {
      // The model is unavailable — but if the knowledge base already answers
      // this, serve that rather than an error.
      const fallback = await findFaqAnswer(message);

      await ChatbotQuery.create({
        userId: user?.id ?? null,
        sessionId,
        message,
        response: fallback ?? "",
      });

      if (fallback) {
        return Response.json({
          reply: fallback,
          recommendations,
          model: "knowledge-base",
        });
      }

      return Response.json(
        {
          error:
            "The assistant couldn't answer that just now. Try again in a moment.",
        },
        { status: 502 },
      );
    }

    await ChatbotQuery.create({
      userId: user?.id ?? null,
      sessionId,
      message,
      response: result.text,
    });

    // Track which FAQ entries are earning their place, for the admin panel.
    void FaqEntry.updateMany(
      {
        isPublished: true,
        question: { $in: extractMatchedQuestions(reference, message) },
      },
      { $inc: { useCount: 1 } },
    ).catch(() => {});

    return Response.json({
      reply: result.text,
      recommendations,
      model: result.model,
    });
  } catch (error) {
    console.error("[api/chat] failed:", error);
    return Response.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}

/**
 * Best-effort guess at which FAQ questions the answer drew on, used only for
 * the usage counter. Deliberately approximate — it is a statistic, not a
 * correctness signal.
 */
function extractMatchedQuestions(reference, message) {
  const terms = message
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const questions = [...reference.matchAll(/^Q: (.+)$/gm)].map(
    (match) => match[1],
  );
  return questions.filter((question) =>
    terms.some((term) => question.toLowerCase().includes(term)),
  );
}

/** Returns the stored transcript so a reopened widget shows the conversation. */
export async function GET(request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!sessionId || sessionId.length < 8) {
    return Response.json({ messages: [] });
  }

  try {
    await connectToDatabase();
    const turns = await ChatbotQuery.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(40)
      .lean();

    return Response.json({
      messages: turns.flatMap((turn) =>
        turn.response
          ? [
              { role: "user", text: turn.message },
              { role: "assistant", text: turn.response },
            ]
          : [{ role: "user", text: turn.message }],
      ),
    });
  } catch (error) {
    console.error("[api/chat] history failed:", error);
    return Response.json({ messages: [] });
  }
}
