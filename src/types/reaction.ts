/**
 * representation of a reaction on the server side
 */
export interface Reaction {
  id: string;
  note: string;
  user: string;
  reactionType: ReactionType;
}

export type ReactionState = Reaction[];

export type ReactionType = "thinking" | "heart" | "like" | "dislike" | "joy" | "celebration" | "poop";

export const ReactionImageMap = new Map<ReactionType, string>([
  ["thinking", "🤔"],
  ["heart", "💖"],
  ["like", "👍"],
  ["dislike", "👎"],
  ["joy", "😂"],
  ["celebration", "🥳"],
  ["poop", "💩"],
]);
