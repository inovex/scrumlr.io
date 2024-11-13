import {createReducer} from "@reduxjs/toolkit";
import {BoardReactionState} from "./types";
import {addedBoardReaction, removeBoardReaction} from "./actions";

const initialState: BoardReactionState = [];

export const boardReactionsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(addedBoardReaction, (state, action) => {
      state.push(action.payload);
    })
    .addCase(removeBoardReaction, (state, action) => state.filter((br) => br.id !== action.payload))
);
