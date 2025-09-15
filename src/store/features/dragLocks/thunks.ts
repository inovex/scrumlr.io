import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {NoteAPI} from "api/note";

export const broadcastNoteDragStart = createAsyncThunk<void, string, {state: ApplicationState}>("dragLocks/broadcastNoteDragStart", async (noteId, {getState}) => {
  const boardId = getState().board.data?.id;

  if (!boardId) return;

  try {
    await NoteAPI.noteDragStart(boardId, noteId);
  } catch (error) {
    // Silently handle errors to avoid disrupting user experience
  }
});

export const broadcastNoteDragEnd = createAsyncThunk<void, string, {state: ApplicationState}>("dragLocks/broadcastNoteDragEnd", async (noteId, {getState}) => {
  const boardId = getState().board.data?.id;

  if (!boardId) return;

  try {
    await NoteAPI.noteDragEnd(boardId, noteId);
  } catch (error) {
    // Silently handle errors to avoid disrupting user experience
  }
});
