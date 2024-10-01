import {createAction} from "@reduxjs/toolkit";
import {BoardReactionType} from "store/features/boardReactions/types";

export const addedBoardReaction = createAction<BoardReactionType>("boardReactions/addedBoardReaction");
export const removeBoardReaction = createAction<string>("boardReactions/removeBoardReaction");
