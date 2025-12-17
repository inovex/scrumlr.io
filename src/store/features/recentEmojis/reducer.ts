import {createReducer} from "@reduxjs/toolkit";
import {RECENT_EMOJIS_STORAGE_KEY} from "constants/storage";
import {getFromStorage} from "utils/storage";
import {EmojiData} from "../reactions/types";
import {RecentEmojisState, initialRecentEmojis} from "./types";
import {addRecentEmoji} from "./thunks";

// Load from localStorage or use defaults
const loadInitialState = (): EmojiData[] => {
  const stored = getFromStorage<string>(RECENT_EMOJIS_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as EmojiData[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Invalid JSON, use defaults
    }
  }
  return initialRecentEmojis;
};

const initialState: RecentEmojisState = {
  emojis: loadInitialState(),
};

export const recentEmojisReducer = createReducer(initialState, (builder) =>
  builder.addCase(addRecentEmoji.fulfilled, (state, action) => {
    state.emojis = action.payload;
  })
);
