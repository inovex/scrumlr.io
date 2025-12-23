import {createAsyncThunk} from "@reduxjs/toolkit";
import {RECENT_EMOJIS_STORAGE_KEY} from "constants/storage";
import {saveToStorage} from "utils/storage";
import {ApplicationState} from "store/store";
import {EmojiData, isPermanentEmoji} from "../reactions/types";
import {MAX_RECENT_EMOJIS} from "./types";

/**
 * Adds an emoji to the recent emojis list.
 * - Most recent emoji goes to position 0 (index 4 in quick bar after permanent emojis)
 * - Duplicates are moved to the front
 * - Maximum of 3 recent emojis
 * - Permanent emojis are ignored
 */
export const addRecentEmoji = createAsyncThunk<EmojiData[], EmojiData, {state: ApplicationState}>("recentEmojis/addRecentEmoji", async (emojiData, {getState}) => {
  if (isPermanentEmoji(emojiData.reactionType)) {
    return getState().recentEmojis.emojis;
  }

  const currentEmojis = getState().recentEmojis.emojis;

  // Remove duplicate if exists (based on emoji character)
  const filtered = currentEmojis.filter((e) => e.reactionType !== emojiData.reactionType);

  // Add new emoji at the front (most recent)
  const updated = [emojiData, ...filtered].slice(0, MAX_RECENT_EMOJIS);

  // Persist to localStorage
  saveToStorage(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(updated));

  return updated;
});
