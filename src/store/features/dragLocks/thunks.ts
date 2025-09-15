import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {NoteAPI} from "api/note";

export const broadcastNoteDragStart = createAsyncThunk<void, string, {state: ApplicationState}>("dragLocks/broadcastNoteDragStart", async (noteId, {getState}) => {
  const boardId = getState().board.data?.id;

  if (!boardId) return;

  try {
    await NoteAPI.noteDragStart(boardId, noteId);
  } catch (error) {
    // For drag events, we don't need to show error toast or retry
    // The drag will still work locally, just without real-time sync
    console.warn("Failed to broadcast drag start:", error);
  }
});

export const broadcastNoteDragEnd = createAsyncThunk<void, string, {state: ApplicationState}>("dragLocks/broadcastNoteDragEnd", async (noteId, {getState}) => {
  const boardId = getState().board.data?.id;

  if (!boardId) return;

  try {
    await NoteAPI.noteDragEnd(boardId, noteId);
  } catch (error) {
    // For drag events, we don't need to show error toast or retry
    // The drag will still work locally, just without real-time sync
    console.warn("Failed to broadcast drag end:", error);
  }
});
