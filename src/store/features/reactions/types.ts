export type Reaction = {
  id: string;
  note: string;
  user: string;
  reactionType: ReactionType;
};

export type ReactionState = Reaction[];

export type ReactionType = "thinking" | "heart" | "like" | "dislike" | "joy" | "celebration" | "poop" | "tada" | "applause";

export const REACTION_EMOJI_MAP = new Map<ReactionType, {emoji: string; skinToneSupported: boolean}>([
  ["thinking", {emoji: "🤔", skinToneSupported: false}],
  ["heart", {emoji: "💖", skinToneSupported: false}],
  ["like", {emoji: "👍", skinToneSupported: true}],
  ["dislike", {emoji: "👎", skinToneSupported: true}],
  ["joy", {emoji: "😂", skinToneSupported: false}],
  ["celebration", {emoji: "🥳", skinToneSupported: false}],
  ["poop", {emoji: "💩", skinToneSupported: false}],
]);
