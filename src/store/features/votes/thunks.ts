import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {API} from "api";
import {createdVote, deletedVote} from "./actions";

export const addVote = createAsyncThunk<void, string, {state: ApplicationState}>("scrumlr.io/addVote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  API.addVote(boardId, payload).then((r) => {
    dispatch(createdVote(r));
  });
});

export const deleteVote = createAsyncThunk<void, string, {state: ApplicationState}>("scrumlr.io/deleteVote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  const voting = getState().votings.open!.id;
  API.deleteVote(boardId, payload).then(() => {
    dispatch(deletedVote({voting, note: payload}));
  });
});
