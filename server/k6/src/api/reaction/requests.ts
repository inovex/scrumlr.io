import {ReactionType} from "../../types/reaction.ts"

export interface CreateReactionRequest {
  note: string;
  reactionType: ReactionType;
}

export interface UpdateReactionRequest {
  reactionType: ReactionType;
}
