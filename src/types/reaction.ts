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

export type ReactionType = "like" | "dislike" | "laughing" | "heart" | "applause";

export const ReactionImageMap = new Map<ReactionType, string>([
  ["like", "👍"],
  ["dislike", "👎"],
  ["laughing", "😄"],
  ["heart", "💖"],
  ["applause", "👏"],
]);
