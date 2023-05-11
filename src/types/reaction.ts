/**
 * representation of a reaction on the server side
 */
export interface Reaction {
  id: string;
  note: string;
  user: string;
  reactionType: string;
}

export type ReactionState = Reaction[];
