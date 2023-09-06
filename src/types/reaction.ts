import {Participant} from "./participant";

export type BoardReactionType = {
  id: string;
  user: Participant;
  reactionType: ReactionType;
};

export type ReactionType = "thinking" | "heart" | "like" | "dislike" | "joy" | "celebration" | "poop" | "applause" | "tada";

export const BoardReactionImageMap = new Map<ReactionType, string>([
  ["tada", "🎉"],
  ["applause", "👏"],
  ["heart", "💖"],
  ["like", "👍"],
  ["dislike", "👎"],
]);

export type BoardReactionState = BoardReactionType[];
