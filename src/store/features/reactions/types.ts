export type Reaction = {
  id: string;
  note: string;
  user: string;
  emoji: string; // default emoji (e.g., "👍")
  skinTone?: number; // 0 (default) to 5 (dark) according to Fitzpatrick scale https://en.wikipedia.org/wiki/Fitzpatrick_scale
};

export type ReactionState = Reaction[];

// Emoji data structure for consistent emoji handling
export type EmojiData = {
  emoji: string;
  type: string;
  unified: string;
  skinToneSupported?: boolean;
};

// The 6 default emojis available in quick selection
export const DEFAULT_EMOJIS: EmojiData[] = [
  {emoji: "💖", type: "heart", unified: "1f496"},
  {emoji: "👍", type: "like", unified: "1f44d", skinToneSupported: true},
  {emoji: "👎", type: "dislike", unified: "1f44e", skinToneSupported: true},
  {emoji: "🥳", type: "celebration", unified: "1f973"},
  {emoji: "😂", type: "joy", unified: "1f602"},
  {emoji: "🤔", type: "thinking", unified: "1f914"},
];

// Permanent emojis that always appear first (heart, like, dislike)
export const PERMANENT_EMOJIS = DEFAULT_EMOJIS.slice(0, 3);

// Fallback emojis to fill remaining slots (celebration, joy, thinking)
export const FALLBACK_EMOJIS = DEFAULT_EMOJIS.slice(3);

// Create a lookup map for quick access to default emoji data
const DEFAULT_EMOJI_MAP = new Map(DEFAULT_EMOJIS.map((emoji) => [emoji.type, emoji]));

/**
 * Builds the quick reaction list with exactly 6 emojis:
 * - First 3: permanent emojis (heart, like, dislike)
 * - Next 3: recent emojis (excluding duplicates), fallback to default emojis
 */
export function buildQuickReactions(recentEmojis: string[]): EmojiData[] {
  const reactions: EmojiData[] = [];

  // Always add permanent emojis first
  reactions.push(...PERMANENT_EMOJIS);

  // Add recent emojis (excluding any that are default emojis)
  const defaultEmojiTypes = new Set(DEFAULT_EMOJIS.map((e) => e.type));
  const filteredRecentEmojis = recentEmojis.filter((emoji) => !defaultEmojiTypes.has(emoji) && !DEFAULT_EMOJI_MAP.has(emoji));

  // Add up to 3 recent emojis
  filteredRecentEmojis.slice(0, 3).forEach((emoji) => {
    reactions.push({emoji, type: emoji, unified: ""});
  });

  // Fill remaining slots with fallback emojis
  if (reactions.length < 6) {
    const usedTypes = new Set(reactions.map((r) => r.type));
    FALLBACK_EMOJIS.forEach((emoji) => {
      if (reactions.length < 6 && !usedTypes.has(emoji.type)) {
        reactions.push(emoji);
      }
    });
  }

  return reactions;
}

/**
 * Gets the emoji display string for a reaction type
 */
export function getEmojiDisplay(reactionType: string): string {
  const defaultEmoji = DEFAULT_EMOJI_MAP.get(reactionType);
  if (defaultEmoji) {
    return defaultEmoji.emoji;
  }

  // For custom emojis, the reactionType should already be the emoji character
  return reactionType;
}

/**
 * Checks if a reaction type is one of the default emojis
 */
export function isDefaultEmoji(reactionType: string): boolean {
  return DEFAULT_EMOJI_MAP.has(reactionType);
}

/**
 * Gets emoji data for a reaction type (returns undefined if not a default emoji)
 */
export function getDefaultEmojiData(reactionType: string): EmojiData | undefined {
  return DEFAULT_EMOJI_MAP.get(reactionType);
}

// Backwards compatibility - DO NOT USE IN NEW CODE
// Use getDefaultEmojiData() instead
export const LEGACY_REACTION_EMOJI_MAP = new Map(
  DEFAULT_EMOJIS.map((emoji) => [
    emoji.type,
    {
      emoji: emoji.emoji,
      unified: emoji.unified,
      skinToneSupported: emoji.skinToneSupported ?? false,
    },
  ])
);
