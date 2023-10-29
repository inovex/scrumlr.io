/**
 * representation of a note reaction on the server side
 */
export type Reaction = {
  id: string;
  note: string;
  user: string;
  reactionType: ReactionType;
};

export type ReactionState = Reaction[];

export type ReactionType = "thinking" | "heart" | "like" | "dislike" | "joy" | "celebration" | "poop" | "tada" | "applause";

export const REACTION_EMOJI_MAP = new Map<ReactionType, string>([
  ["thinking", "🤔"],
  ["heart", "💖"],
  ["like", "👍"],
  ["dislike", "👎"],
  ["joy", "😂"],
  ["celebration", "🥳"],
  ["poop", "💩"],
]);
