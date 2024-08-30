import {ReactionType} from "store/features/reactions/types";

/**
 * representation of a board reaction on the server side
 */
export type BoardReactionType = {
  id: string;
  user: string;
  reactionType: ReactionType;
};

export const BOARD_REACTION_EMOJI_MAP = new Map<ReactionType, {emoji: string; skinToneSupported: boolean}>([
  ["tada", {emoji: "🎉", skinToneSupported: false}],
  ["applause", {emoji: "👏", skinToneSupported: true}],
  ["heart", {emoji: "💖", skinToneSupported: false}],
  ["like", {emoji: "👍", skinToneSupported: true}],
  ["dislike", {emoji: "👎", skinToneSupported: true}],
]);

export type BoardReactionState = BoardReactionType[];
