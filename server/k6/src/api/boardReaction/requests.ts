import type { BoardReaction } from "../../types/boardReaction.ts";

export interface CreateBoardReactionRequest {
	reactionType: BoardReaction;
}
