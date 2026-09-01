import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "api";
import { ApplicationState, retryable } from "store";
import { CreateVotingRequest , Voting} from "./types";

export const getAllVotings = createAsyncThunk<Voting[], {boardId: string}, {state: ApplicationState}>("votings/getAllvotings", async (payload, {dispatch, getState}) => {
  const votings = await API.getVotings(payload.boardId);
  return votings;
});

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
