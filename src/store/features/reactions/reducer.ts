import {createReducer} from "@reduxjs/toolkit";
import {ReactionState} from "./types";
import {addedReaction, deletedReaction, updatedReaction} from "./actions";
import {getAllReactions} from "./thunks";

const initialState: ReactionState = [];

export const reactionsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(getAllReactions.fulfilled, (_state, action) => action.payload)
    .addCase(addedReaction, (state, action) => {
      state.push(action.payload);
    })
    .addCase(deletedReaction, (state, action) => state.filter((r) => r.id !== action.payload))
    .addCase(updatedReaction, (state, action) => state.map((r) => (r.id !== action.payload.id ? r : action.payload)))
);
