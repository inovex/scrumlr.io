import {createReducer} from "@reduxjs/toolkit";
import {getSessions} from "./thunks";
import {SessionsState} from "./types";
import {EXAMPLE_SESSIONS_FOR_SEARCH_FCT} from "../../../constants/templates";

// TODO: initially empty
const initialState: SessionsState = EXAMPLE_SESSIONS_FOR_SEARCH_FCT;

export const sessionsReducer = createReducer(initialState, (builder) => {
  builder.addCase(getSessions.fulfilled, (_state, action) => [...EXAMPLE_SESSIONS_FOR_SEARCH_FCT, ...action.payload.map((twc) => twc)]);
});
