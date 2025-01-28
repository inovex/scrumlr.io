import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState, retryable} from "store";
import {createdVote, deletedVote} from "./actions";

export const addVote = createAsyncThunk<void, string, {state: ApplicationState}>("votes/addVote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  await retryable(
    () => API.addVote(boardId, payload),
    dispatch,
    () => addVote(payload),
    "addVote"
  ).then((r) => dispatch(createdVote(r)));
});

export const deleteVote = createAsyncThunk<void, string, {state: ApplicationState}>("votes/deleteVote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  const voting = getState().votings.open!.id;
  await retryable(
    () => API.deleteVote(boardId, payload),
    dispatch,
    () => deleteVote(payload),
    "deleteVote"
  ).then(() => {
    dispatch(deletedVote({voting, note: payload}));
  });
});
