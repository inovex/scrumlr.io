import {createReducer} from "@reduxjs/toolkit";
import {RequestsState} from "./types";
import {initializeBoard} from "../board";
import {createJoinRequest, updateJoinRequest} from "./actions";

const initialState: RequestsState = [];

export const requestsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => action.payload.fullBoard.requests)
    .addCase(createJoinRequest, (state, action) => {
      state.push(action.payload);
    })
    .addCase(updateJoinRequest, (state, action) => state.map((r) => (r.user.id !== action.payload.user.id ? r : action.payload)))
);
