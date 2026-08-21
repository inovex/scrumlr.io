export type ReactionType =
  | "thinking"
  | "heart"
  | "like"
  | "dislike"
  | "joy"
  | "celebration"
  | "poop";

  export interface Reaction {
  id: string;
  note: string;
  user: string;
  reactionType: ReactionType;
}
