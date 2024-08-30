import {createAction} from "@reduxjs/toolkit";
import {ReactionType} from "store/features/reactions/reaction";
import {BoardReactionType} from "store/features/boardReactions/boardReaction";

export const addBoardReaction = createAction<ReactionType>("scrumlr.io/addBoardReaction");
export const addedBoardReaction = createAction<BoardReactionType>("scrumlr.io/addedBoardReaction");
export const removeBoardReaction = createAction<string>("scrumlr.io/removeBoardReaction");
