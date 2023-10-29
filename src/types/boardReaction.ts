import {ReactionType} from "./reaction";

/**
 * representation of a board reaction on the server side
 */
export type BoardReactionType = {
  id: string;
  user: string;
  reactionType: ReactionType;
};

export const BOARD_REACTION_EMOJI_MAP = new Map<ReactionType, string>([
  ["tada", "🎉"],
  ["applause", "👏"],
  ["heart", "💖"],
  ["like", "👍"],
  ["dislike", "👎"],
]);

export type BoardReactionState = BoardReactionType[];
