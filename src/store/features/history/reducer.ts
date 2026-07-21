import {createReducer, createAction} from "@reduxjs/toolkit";
import {HistoryBoard, HistoryState} from "./types";
import {getBoards} from "./thunks";

const initialState: HistoryState = [];

// mock: patches the board in place on save. TODO: with a real backend this is replaced by a re-fetch / websocket update after PUT /boards/{id}.
export const updateHistoryBoard = createAction<{id: string; changes: Partial<HistoryBoard>}>("history/updateHistoryBoard");

// toggles the current user's favourite flag for a board. TODO: with a real backend maybe PUT /boards/{id}/participants/{userId} { favourite }.
export const toggleHistoryBoardFavourite = createAction<string>("history/toggleFavourite");

// removes a board from the history list (owner-only, gated in the UI). TODO: Add a delete confirmation dialog with a real backend, DELETE /boards/{id}.
export const removeHistoryBoard = createAction<string>("history/removeBoard");

export const historyReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getBoards.fulfilled, (_state, action) => action.payload)
    .addCase(updateHistoryBoard, (state, action) => state.map((board) => (board.id === action.payload.id ? {...board, ...action.payload.changes} : board)))
    .addCase(toggleHistoryBoardFavourite, (state, action) => state.map((board) => (board.id === action.payload ? {...board, favourite: !board.favourite} : board)))
    .addCase(removeHistoryBoard, (state, action) => state.filter((board) => board.id !== action.payload));
});
