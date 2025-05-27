import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "../../../api";
import {ReactionType} from "./types";

export const addReaction = createAsyncThunk<void, {noteId: string; reactionType: ReactionType}, {state: ApplicationState}>("reactions/addReaction", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.addReaction(boardId, payload.noteId, payload.reactionType);
});

export const updateReaction = createAsyncThunk<void, {reactionId: string; reactionType: ReactionType}, {state: ApplicationState}>(
  "reactions/updateReaction",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.updateReaction(boardId, payload.reactionId, payload.reactionType);
  }
);

export const deleteReaction = createAsyncThunk<void, string, {state: ApplicationState}>("reactions/deleteReaction", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.deleteReaction(boardId, payload);
});
