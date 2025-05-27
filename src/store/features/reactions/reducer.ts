import {createReducer} from "@reduxjs/toolkit";
import {ReactionState} from "./types";
import {initializeBoard} from "../board";
import {addedReaction, deletedReaction, updatedReaction} from "./actions";

const initialState: ReactionState = [];

export const reactionsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => action.payload.fullBoard.reactions)
    .addCase(addedReaction, (state, action) => {
      state.push(action.payload);
    })
    .addCase(deletedReaction, (state, action) => state.filter((r) => r.id !== action.payload))
    .addCase(updatedReaction, (state, action) => state.map((r) => (r.id !== action.payload.id ? r : action.payload)))
);
