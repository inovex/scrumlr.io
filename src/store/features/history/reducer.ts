import {createReducer} from "@reduxjs/toolkit";
import {HistoryState} from "./types";
import {getBoards, setBoardFavourite, deleteHistoryBoard} from "./thunks";

const initialState: HistoryState = [];

export const historyReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getBoards.fulfilled, (_state, action) => {
      return action.payload;
    })
    .addCase(setBoardFavourite.fulfilled, (state, action) => {
      return state.map((board) => (board.id === action.payload.boardId ? {...board, favourite: action.payload.favourite} : board));
    })
    .addCase(deleteHistoryBoard.fulfilled, (state, action) => {
      return state.filter((board) => board.id !== action.payload);
    });
});
