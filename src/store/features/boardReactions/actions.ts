import {createAction} from "@reduxjs/toolkit";
import {ReactionType} from "store/features/reactions/types";
import {BoardReactionType} from "store/features/boardReactions/types";

export const addBoardReaction = createAction<ReactionType>("scrumlr.io/addBoardReaction");
export const addedBoardReaction = createAction<BoardReactionType>("scrumlr.io/addedBoardReaction");
export const removeBoardReaction = createAction<string>("scrumlr.io/removeBoardReaction");