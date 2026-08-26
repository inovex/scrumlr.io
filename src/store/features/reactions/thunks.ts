import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "../../../api";
import {Reaction} from "./types";

export const getAllReactions = createAsyncThunk<Reaction[], {boardId: string}, {state: ApplicationState}>("notes/getAllNotes", async (payload, {dispatch, getState}) => {
  const reactions = await API.getReactions(payload.boardId);
  return reactions;
});

export const addReaction = createAsyncThunk<void, {noteId: string; emoji: string}, {state: ApplicationState}>("reactions/addReaction", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.addReaction(boardId, payload.noteId, payload.emoji);
});

export const updateReaction = createAsyncThunk<void, {reactionId: string; emoji: string}, {state: ApplicationState}>("reactions/updateReaction", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.updateReaction(boardId, payload.reactionId, payload.emoji);
});

export const deleteReaction = createAsyncThunk<void, string, {state: ApplicationState}>("reactions/deleteReaction", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.deleteReaction(boardId, payload);
});
