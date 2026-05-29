/**
 * Zustand Global Store
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quote {
  _id: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  mood: string;
  level: string;
  cultural_note?: string;
  audio_url?: string;
  view_count: number;
  save_count: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  level: string;
  xp: number;
  streak_days: number;
  premium: boolean;
  tutor_persona: string;
}

interface OnboardingData {
  completed: boolean;
  level: string;           // "beginner" | "hsk1" | "hsk2" | "hsk3" | "hsk4" | "hsk5" | "hsk6"
  goal: string;            // "travel" | "drama" | "business" | "culture" | "fun"
  favMoods: string[];      // ["romantic", "motivation", ...]
  dailyGoal: number;       // 5 | 10 | 20 mins
}

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Onboarding
  onboarding: OnboardingData;
  setOnboarding: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;

  // Daily Quote
  dailyQuote: Quote | null;
  setDailyQuote: (quote: Quote) => void;

  // Pinyin toggle
  showPinyin: boolean;
  togglePinyin: () => void;

  // Saved quotes
  savedQuoteIds: string[];
  toggleSaveQuote: (id: string) => void;
  isQuoteSaved: (id: string) => boolean;

  // Feed filter
  feedMoodFilter: string | null;
  feedLevelFilter: string | null;
  setFeedFilter: (mood: string | null, level: string | null) => void;

  // AI Tutor
  selectedPersona: string;
  setPersona: (persona: string) => void;

  // Chat messages (per session, không persist)
  chatMessages: { role: "user" | "assistant"; content: string }[];
  addChatMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  clearChat: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // Onboarding
      onboarding: {
        completed: false,
        level: "beginner",
        goal: "fun",
        favMoods: ["romantic", "motivation"],
        dailyGoal: 10,
      },
      setOnboarding: (data) =>
        set((s) => ({ onboarding: { ...s.onboarding, ...data } })),
      completeOnboarding: () =>
        set((s) => ({ onboarding: { ...s.onboarding, completed: true } })),

      // Daily Quote
      dailyQuote: null,
      setDailyQuote: (quote) => set({ dailyQuote: quote }),

      // Pinyin toggle
      showPinyin: true,
      togglePinyin: () => set((s) => ({ showPinyin: !s.showPinyin })),

      // Saved quotes
      savedQuoteIds: [],
      toggleSaveQuote: (id) =>
        set((s) => ({
          savedQuoteIds: s.savedQuoteIds.includes(id)
            ? s.savedQuoteIds.filter((i) => i !== id)
            : [...s.savedQuoteIds, id],
        })),
      isQuoteSaved: (id) => get().savedQuoteIds.includes(id),

      // Feed filter
      feedMoodFilter: null,
      feedLevelFilter: null,
      setFeedFilter: (mood, level) =>
        set({ feedMoodFilter: mood, feedLevelFilter: level }),

      // AI Tutor
      selectedPersona: "caring_friend",
      setPersona: (persona) => set({ selectedPersona: persona }),

      // Chat — KHÔNG persist
      chatMessages: [],
      addChatMessage: (msg) =>
        set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),
    }),
    {
      name: "mandomood-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        showPinyin: state.showPinyin,
        savedQuoteIds: state.savedQuoteIds,
        selectedPersona: state.selectedPersona,
        feedMoodFilter: state.feedMoodFilter,
        feedLevelFilter: state.feedLevelFilter,
        user: state.user,
        onboarding: state.onboarding,
      }),
    }
  )
);
