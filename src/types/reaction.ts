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
