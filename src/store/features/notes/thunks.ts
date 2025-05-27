import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState, retryable} from "store";
import {Toast} from "utils/Toast";
import i18n from "i18n";
import {EditNote} from "./types";

export const addNote = createAsyncThunk<void, {columnId: string; text: string}, {state: ApplicationState}>("notes/addNote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  await retryable(
    () => API.addNote(boardId, payload.columnId, payload.text),
    dispatch,
    () => addNote({...payload}),
    "addNote"
  );
});

export const editNote = createAsyncThunk<void, {noteId: string; request: EditNote}, {state: ApplicationState}>("notes/editNote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  await retryable(
    () => API.editNote(boardId, payload.noteId, payload.request),
    dispatch,
    () => editNote({...payload}),
    "editNote"
  );
});

export const unstackNote = createAsyncThunk<void, {noteId: string}, {state: ApplicationState}>("notes/unstackNote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  const note = getState().notes.find((n) => n.id === payload.noteId)!;
  const parent = getState().notes.find((n) => n.id === note.position.stack)!;

  await retryable(
    () => API.editNote(boardId, payload.noteId, {position: {column: note.position.column, stack: null, rank: Math.max(parent.position.rank - 1, 0)}}),
    dispatch,
    () => unstackNote({...payload}),
    "unstackNote"
  );
});

export const deleteNote = createAsyncThunk<void, {noteId: string; deleteStack: boolean}, {state: ApplicationState}>("notes/deleteNote", async (payload, {dispatch, getState}) => {
  const boardId = getState().board.data!.id;
  const {moderating} = getState().view;
  const sharedNoteId = getState().board.data?.sharedNote;

  if (sharedNoteId === payload.noteId && !moderating) {
    // TODO should this logic be here?
    Toast.error({title: i18n.t("Error.deleteNoteWhenShared")});
  } else
    await retryable(
      () => API.deleteNote(boardId, payload.noteId, payload.deleteStack),
      dispatch,
      () => deleteNote({...payload}),
      "deleteNote"
    );
});
