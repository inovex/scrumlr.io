/**
 * Reaction stored in state (from backend)
 */
export type Reaction = {
  id: string;
  note: string;
  user: string;
  reactionType: string; // emoji unicode character (e.g., "👍")
};

export type ReactionState = Reaction[];

export type EmojiData = {
  reactionType: string; // default unicode character
  skinToneIndex?: number; // 0 (default) to 5 (dark)
};

// The 3 permanent emojis that always appear first and cannot be overridden
export const PERMANENT_EMOJIS: EmojiData[] = [{reactionType: "💖"}, {reactionType: "👍"}, {reactionType: "👎"}];

// Default fallback emojis used when no recent emojis exist
export const DEFAULT_RECENT_EMOJIS: EmojiData[] = [{reactionType: "🥳"}, {reactionType: "😂"}, {reactionType: "🤔"}];

// Checks if an emoji is one of the permanent emojis
export function isPermanentEmoji(emoji: string): boolean {
  return PERMANENT_EMOJIS.some((e) => e.reactionType === emoji);
}
