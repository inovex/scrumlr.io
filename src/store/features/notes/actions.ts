import {createAction} from "@reduxjs/toolkit";
import {Note} from "./types";

export const syncNotes = createAction<Note[]>("scrumlr.io/syncNotes");
export const updatedNotes = createAction<Note[]>("scrumlr.io/updatedNotes");

export const deletedNote = createAction<{noteId: string; deleteStack: boolean}>("scrumlr.io/deletedNote");

export const onNoteFocus = createAction("scrumlr.io/onNoteFocus");
export const onNoteBlur = createAction("scrumlr.io/onNoteBlur");
