import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {API} from "api";
import {CreateVotingRequest} from "./types";

export const createVoting = createAsyncThunk<void, CreateVotingRequest, {state: ApplicationState}>("scrumlr.io/createVoting", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;

  await API.createVoting(boardId, payload);
});

export const closeVoting = createAsyncThunk<void, string, {state: ApplicationState}>("scrumlr.io/closeVoting", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;

  await API.changeVotingStatus(boardId, payload, "CLOSED");
});
