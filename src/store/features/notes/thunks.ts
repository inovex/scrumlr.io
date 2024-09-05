import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {API} from "api";
import {EditNote} from "./types";

export const addNote = createAsyncThunk<void, {columnId: string; text: string}, {state: ApplicationState}>("scrumlr.io/addNote", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.addNote(boardId, payload.columnId, payload.text);
});

export const editNote = createAsyncThunk<void, {noteId: string; request: EditNote}, {state: ApplicationState}>("scrumlr.io/editNote", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.editNote(boardId, payload.noteId, payload.request);
});

export const unstackNote = createAsyncThunk<void, {noteId: string; request: EditNote}, {state: ApplicationState}>("scrumlr.io/unstackNote", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  const note = getState().notes.find((n) => n.id === payload.noteId)!;
  const parent = getState().notes.find((n) => n.id === note.position.stack)!;

  await API.editNote(boardId, payload.noteId, {position: {column: note.position.column, stack: null, rank: Math.max(parent.position.rank - 1, 0)}});
});

export const deleteNote = createAsyncThunk<void, {noteId: string; deleteStack: boolean}, {state: ApplicationState}>("scrumlr.io/deleteNote", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  const {moderating} = getState().view;
  const sharedNoteId = getState().board.data?.sharedNote;

  // should that logic really be here?
  if (sharedNoteId === payload.noteId && !moderating) {
    // error
  } else await API.deleteNote(boardId, payload.noteId, payload.deleteStack);
});
