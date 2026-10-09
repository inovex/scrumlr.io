import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "api";
import { ApplicationState, retryable } from "store";
import { CreateVotingRequest } from "./types";
import { syncedVotingResults } from "./actions";

export const createVoting = createAsyncThunk<void, CreateVotingRequest, { state: ApplicationState }>("votings/createVoting", async (payload, { dispatch, getState }) => {
  const boardId = getState().board.data!.id;

  await retryable(
    () => API.createVoting(boardId, payload),
    dispatch,
    () => createVoting({ ...payload }),
    "createVoting"
  );
});

export const closeVoting = createAsyncThunk<void, string, { state: ApplicationState }>("votings/closeVoting", async (payload, { dispatch, getState }) => {
  const boardId = getState().board.data!.id;

  await retryable(
    () => API.changeVotingStatus(boardId, payload, "CLOSED"),
    dispatch,
    () => closeVoting(payload),
    "closeVoting"
  );
});

export const abortVoting = createAsyncThunk<void, string, { state: ApplicationState }>("votings/abortVoting", async (payload, { dispatch, getState }) => {
  const boardId = getState().board.data!.id;

  await retryable(
    () => API.changeVotingStatus(boardId, payload, "ABORTED"),
    dispatch,
    () => abortVoting(payload),
    "abortVoting"
  );
});

// refetches the results of the latest closed voting, e.g. when previously hidden notes became visible
export const syncVotingResults = createAsyncThunk<void, void, { state: ApplicationState }>("votings/syncVotingResults", async (_payload, { dispatch, getState }) => {
  const boardId = getState().board.data!.id;
  const latestVoting = getState().votings.past[0];

  if (latestVoting?.status !== "CLOSED") return;

  const voting = await API.getVoting(boardId, latestVoting.id);
  dispatch(syncedVotingResults(voting));
});
