import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {NoteAPI} from "api/note";

export const updateNoteDragState = createAsyncThunk<void, {noteId: string; dragging: boolean}, {state: ApplicationState}>(
  "dragLocks/updateNoteDragState",
  async ({noteId, dragging}, {getState}) => {
    const boardId = getState().board.data?.id;

    if (!boardId) return;

    try {
      await NoteAPI.updateNoteDragState(boardId, noteId, dragging);
    } catch (error) {
      // Silently handle errors to avoid disrupting user experience
    }
  }
);

// Convenience thunks for backward compatibility
export const broadcastNoteDragStart = createAsyncThunk<void, string, {state: ApplicationState}>("dragLocks/broadcastNoteDragStart", async (noteId, {dispatch}) => {
  dispatch(updateNoteDragState({noteId, dragging: true}));
});

export const broadcastNoteDragEnd = createAsyncThunk<void, string, {state: ApplicationState}>("dragLocks/broadcastNoteDragEnd", async (noteId, {dispatch}) => {
  dispatch(updateNoteDragState({noteId, dragging: false}));
});
