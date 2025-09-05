export type Reaction = {
  id: string;
  note: string;
  user: string;
  reactionType: ReactionType;
};

export type ReactionState = Reaction[];

export type ReactionType = string;

// Legacy reaction mappings for backward compatibility
export const LEGACY_REACTION_EMOJI_MAP = new Map<string, {emoji: string; unified: string; skinToneSupported: boolean}>([
  ["thinking", {emoji: "🤔", unified: "1f914", skinToneSupported: false}],
  ["heart", {emoji: "💖", unified: "1f496", skinToneSupported: false}],
  ["like", {emoji: "👍", unified: "1f44d", skinToneSupported: true}],
  ["dislike", {emoji: "👎", unified: "1f44e", skinToneSupported: true}],
  ["joy", {emoji: "😂", unified: "1f602", skinToneSupported: false}],
  ["celebration", {emoji: "🥳", unified: "1f973", skinToneSupported: false}],
  ["poop", {emoji: "💩", unified: "1f4a9", skinToneSupported: false}],
]);

// Quick access to legacy reactions for the reaction bar (limited for space)
export const QUICK_REACTIONS = Array.from(LEGACY_REACTION_EMOJI_MAP.entries()).slice(0, 5); // Show only first 5 to make room for + button

// Utility function to get emoji display from reaction type
export const getEmojiDisplay = (reactionType: string): string => {
  // First check if it's a legacy reaction
  const legacyReaction = LEGACY_REACTION_EMOJI_MAP.get(reactionType);
  if (legacyReaction) {
    return legacyReaction.emoji;
  }

  // For new emoji reactions, the reactionType should already be the emoji or Unicode
  return reactionType;
};

// Check if a reaction supports skin tone (for legacy reactions)
export const reactionSupportsSkinTone = (reactionType: string): boolean => {
  const legacyReaction = LEGACY_REACTION_EMOJI_MAP.get(reactionType);
  return legacyReaction?.skinToneSupported ?? false;
};
