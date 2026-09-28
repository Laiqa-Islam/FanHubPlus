/**
 * Guided onboarding prompts for the assistant (SRS FR-4).
 *
 * These live outside `lib/assistant.ts` because that module is marked
 * `server-only` — the chat widget is a Client Component and cannot import it.
 */
export const ONBOARDING_STEPS = [
  {
    id: "start",
    label: "What is Fan Hub Plus?",
    prompt: "What is Fan Hub Plus and what can I do here?",
  },
  {
    id: "browse",
    label: "How do I find things?",
    prompt: "How do I search and filter content across the channels?",
  },
  {
    id: "watch",
    label: "Where's the video and audio?",
    prompt:
      "Where can I watch videos and listen to audio, and can I rate them?",
  },
  {
    id: "save",
    label: "How do I save things?",
    prompt: "How do saves work and how do I add a note to one?",
  },
  {
    id: "events",
    label: "Find events near me",
    prompt: "How do I find fan conventions and meetups near me?",
  },
  {
    id: "recommend",
    label: "Recommend me something",
    prompt: "Recommend something good to read or watch based on my channels.",
  },
];
