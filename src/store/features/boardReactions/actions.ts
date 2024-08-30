import {createAction} from "@reduxjs/toolkit";
import {ReactionType} from "types/reaction";
import {BoardReactionType} from "types/boardReaction";

export const addBoardReaction = createAction<ReactionType>("scrumlr.io/addBoardReaction");
export const addedBoardReaction = createAction<BoardReactionType>("scrumlr.io/addedBoardReaction");
export const removeBoardReaction = createAction<string>("scrumlr.io/removeBoardReaction");
