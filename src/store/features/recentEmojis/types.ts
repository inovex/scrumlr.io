import {EmojiData, DEFAULT_RECENT_EMOJIS} from "../reactions/types";

export const MAX_RECENT_EMOJIS = 3;

export type RecentEmojisState = {
  emojis: EmojiData[];
};

export const initialRecentEmojis: EmojiData[] = [...DEFAULT_RECENT_EMOJIS];
