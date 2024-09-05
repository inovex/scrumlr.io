import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "../../../types";
import {API} from "../../../api";
import {ReactionType} from "./types";

export const addReaction = createAsyncThunk<void, {noteId: string; reactionType: ReactionType}, {state: ApplicationState}>(
  "scrumlr.io/addReaction",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.addReaction(boardId, payload.noteId, payload.reactionType);
  }
);

export const updateReaction = createAsyncThunk<void, {reactionId: string; reactionType: ReactionType}, {state: ApplicationState}>(
  "scrumlr.io/updateReaction",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.updateReaction(boardId, payload.reactionId, payload.reactionType);
  }
);

export const deleteReaction = createAsyncThunk<void, string, {state: ApplicationState}>("scrumlr.io/deleteReaction", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.deleteReaction(boardId, payload);
});
