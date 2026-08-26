import {createReducer} from "@reduxjs/toolkit";
import {RequestsState} from "./types";
import {createJoinRequest, updateJoinRequest} from "./actions";
import {getAllRequests} from "./thunks";

const initialState: RequestsState = [];

export const requestsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(getAllRequests.fulfilled, (_state, action) => action.payload)
    .addCase(createJoinRequest, (state, action) => {
      state.push(action.payload);
    })
    .addCase(updateJoinRequest, (state, action) => state.map((r) => (r.user.id !== action.payload.user.id ? r : action.payload)))
);
