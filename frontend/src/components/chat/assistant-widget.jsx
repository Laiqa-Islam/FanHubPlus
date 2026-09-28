import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";

import { ONBOARDING_STEPS } from "@/lib/assistant-steps";
import { cn } from "@/lib/utils";

/**
 * The assistant (SRS FR-4): FAQ answering, guided onboarding and content
 * recommendations, in a docked panel.
 *
 * Replies are rendered as plain text, never as HTML — the model's output is
 * untrusted by definition and must not be able to inject markup.
 */

const SESSION_KEY = "fanhub:chat-session";

/** Stable per-browser id so a conversation survives reloads. */
function getSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = `s_${crypto.randomUUID().replace(/-/g, "")}`.slice(0, 40);
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Private mode with storage blocked: fall back to a per-tab id.
    return `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState(false);

  const sessionRef = useRef("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Restore the transcript the first time the panel is opened.
  useEffect(() => {
    if (!open || loadedHistory) return;
    setLoadedHistory(true);
    sessionRef.current = getSessionId();

    (async () => {
      try {
        const response = await fetch(
          `/api/chat?sessionId=${sessionRef.current}`,
        );
        const data = await response.json();
        if (data.messages?.length) setMessages(data.messages);
      } catch {
        // A missing transcript is not worth interrupting anyone over.
      }
    })();
  }, [open, loadedHistory]);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (text) => {
      const question = text.trim();
      if (!question || sending) return;

      if (!sessionRef.current) sessionRef.current = getSessionId();

      setMessages((current) => [...current, { role: "user", text: question }]);
      setInput("");
      setSending(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: question,
            sessionId: sessionRef.current,
          }),
        });
        const data = await response.json();

        setMessages((current) => [
          ...current,
          data.reply
            ? {
                role: "assistant",
                text: data.reply,
                recommendations: data.recommendations,
              }
            : {
                role: "assistant",
                text:
                  data.error ?? "Something went wrong. Try again in a moment.",
              },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: "I couldn't reach the server. Check your connection.",
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [sending],
  );

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close the assistant" : "Ask the assistant"}
        className={cn(
          "fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-[80] inline-flex items-center gap-2 rounded-2xl border border-[var(--edge)] px-4 py-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] shadow-[var(--lift-md)] transition-[transform,box-shadow] duration-150 hover:-translate-y-[2px] hover:shadow-[var(--lift-md)]",
          open
            ? "bg-[var(--n1)] text-[var(--void)]"
            : "bg-[var(--spot)] text-[var(--void)]",
        )}
      >
        {open ? (
          <X className="h-4 w-4" aria-hidden />
        ) : (
          <MessageSquare className="h-4 w-4" aria-hidden />
        )}
        {open ? "Close" : "Ask"}
      </button>

      {open && (
        <aside
          aria-label="Assistant"
          className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[80] flex h-[min(34rem,calc(100dvh-6.5rem-env(safe-area-inset-bottom)))] min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper)] shadow-[var(--lift-md)] sm:inset-x-auto sm:bottom-20 sm:right-5 sm:w-[min(26rem,calc(100vw-2.5rem))]"
        >
          {/* Masthead */}
          <header className="shrink-0 border-b border-[var(--rule-strong)] bg-[var(--paper-3)] px-4 py-2.5">
            <p className="flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[var(--ink)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              The desk assistant
            </p>
          </header>

          {/* Transcript */}
          <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div>
                <p className="font-display text-[1.08rem] leading-[0.95]">
                  Ask me about the issue
                </p>
                <p className="mt-2 text-[0.88rem] leading-snug text-[var(--ink-soft)]">
                  I know what&apos;s on this site — the channels, the pieces,
                  the events and how everything works. Start with one of these:
                </p>

                <ul className="mt-4 flex flex-col gap-2">
                  {ONBOARDING_STEPS.map((step, index) => (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => send(step.prompt)}
                        className="flex w-full items-center gap-3 border border-[var(--rule-strong)] px-3 py-2 text-left transition-colors hover:border-[var(--edge)] hover:bg-[var(--paper-2)]"
                      >
                        <span className="font-mono text-[0.6rem] tabular-nums text-[var(--ink-faint)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[0.88rem]">{step.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {messages.map((message, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex flex-col",
                      message.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <span className="mb-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                      {message.role === "user" ? "You" : "Assistant"}
                    </span>

                    {/* Plain text only: model output is never rendered as HTML. */}
                    <p
                      className={cn(
                        "max-w-[92%] break-words whitespace-pre-line border px-3 py-2 text-[0.9rem] leading-snug",
                        message.role === "user"
                          ? "border-[var(--edge)] bg-[var(--n1)] text-[var(--void)]"
                          : "border-[var(--rule-strong)] bg-[var(--paper-2)]",
                      )}
                    >
                      {message.text}
                    </p>

                    {message.recommendations &&
                      message.recommendations.length > 0 && (
                        <div className="mt-2 w-full">
                          <p className="mark mb-1.5 !text-[0.54rem]">
                            Have a look at
                          </p>
                          <ul className="flex flex-col">
                            {message.recommendations.map((item) => (
                              <li key={item.href}>
                                <Link
                                  to={item.href}
                                  onClick={() => setOpen(false)}
                                  className="group flex items-baseline gap-2 border-b border-[var(--rule)] py-1.5"
                                >
                                  <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                                    {item.channel}
                                  </span>
                                  <span className="min-w-0 flex-1 truncate font-display text-[0.95rem] leading-none transition-colors group-hover:text-[var(--spot-deep)]">
                                    {item.title}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </li>
                ))}

                {sending && (
                  <li className="flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Thinking
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="flex shrink-0 gap-0 border-t border-[var(--rule-strong)]"
          >
            <label className="sr-only" htmlFor="assistant-input">
              Ask a question
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1000}
              placeholder="Ask about anything on the site…"
              className="min-w-0 flex-1 bg-[var(--paper)] px-3 py-3 text-[0.9rem] placeholder:text-[var(--ink-faint)] focus:outline-none"
            />

            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send"
              className="grid w-12 shrink-0 place-items-center border-l border-[var(--rule-strong)] bg-[var(--spot)] text-[var(--void)] transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </form>

          <p className="shrink-0 border-t border-[var(--rule)] px-3 py-1.5 font-mono text-[0.54rem] leading-snug text-[var(--ink-faint)]">
            AI-generated answers can be wrong. Never share passwords or payment
            details.
          </p>
        </aside>
      )}
    </>
  );
}
