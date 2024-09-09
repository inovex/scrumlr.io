import {createAction} from "@reduxjs/toolkit";
import {BoardReactionType} from "store/features/boardReactions/types";

export const addedBoardReaction = createAction<BoardReactionType>("scrumlr.io/addedBoardReaction");
export const removeBoardReaction = createAction<string>("scrumlr.io/removeBoardReaction");
