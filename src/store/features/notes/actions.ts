import {createAction} from "@reduxjs/toolkit";
import {EditNote, Note} from "./types";

export const addNote = createAction<{columnId: string; text: string}>("scrumlr.io/addNote");
export const syncNotes = createAction<Note[]>("scrumlr.io/syncNotes");
export const updatedNotes = createAction<Note[]>("scrumlr.io/updatedNotes");

export const editNote = createAction<{noteId: string; request: EditNote}>("scrumlr.io/editNote");
export const unstackNote = createAction<string>("scrumlr.io/unstackNote");

export const deleteNote = createAction<{noteId: string; deleteStack: boolean}>("scrumlr.io/deleteNote");
export const deletedNote = createAction<{noteId: string; deleteStack: boolean}>("scrumlr.io/deletedNote");

export const shareNote = createAction<string>("scrumlr.io/shareNote");
export const stopSharing = createAction("scrumlr.io/stopSharing");

export const onNoteFocus = createAction("scrumlr.io/onNoteFocus");
export const onNoteBlur = createAction("scrumlr.io/onNoteBlur");
