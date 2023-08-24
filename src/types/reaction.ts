export type BoardReaction = {
  user: string; // participant uuid
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
