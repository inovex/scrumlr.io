import {createReducer} from "@reduxjs/toolkit";
import {DragLockState} from "./types";
import {noteDragStarted, noteDragEnded} from "./actions";
import {initializeBoard} from "../board";

const initialState: DragLockState = {
  lockedNotes: {},
};

export const dragLocksReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, () => initialState) // Reset locks when board changes
    .addCase(noteDragStarted, (state, action) => {
      state.lockedNotes[action.payload.noteId] = action.payload.userId;
    })
    .addCase(noteDragEnded, (state, action) => {
      delete state.lockedNotes[action.payload.noteId];
    })
);
