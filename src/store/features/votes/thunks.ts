import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState} from "store";
import {createdVote, deletedVote} from "./actions";

export const addVote = createAsyncThunk<void, string, {state: ApplicationState}>("votes/addVote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  API.addVote(boardId, payload).then((r) => {
    dispatch(createdVote(r));
  });
});

export const deleteVote = createAsyncThunk<void, string, {state: ApplicationState}>("votes/deleteVote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  const voting = getState().votings.open!.id;
  API.deleteVote(boardId, payload).then(() => {
    dispatch(deletedVote({voting, note: payload}));
  });
});
