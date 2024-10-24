import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState, retryable} from "store";
import {CreateVotingRequest} from "./types";

export const createVoting = createAsyncThunk<void, CreateVotingRequest, {state: ApplicationState}>("votings/createVoting", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;

  await retryable(
    () => API.createVoting(boardId, payload),
    dispatch,
    () => createVoting({...payload}),
    "createVoting"
  );
});

export const closeVoting = createAsyncThunk<void, string, {state: ApplicationState}>("votings/closeVoting", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;

  await retryable(
    () => API.changeVotingStatus(boardId, payload, "CLOSED"),
    dispatch,
    () => closeVoting(payload),
    "closeVoting"
  );
});
