import {createAction} from "@reduxjs/toolkit";
import {Note} from "./types";

export const syncNotes = createAction<Note[]>("notes/syncNotes");
export const updatedNotes = createAction<Note[]>("notes/updatedNotes");

export const deletedNote = createAction<string>("notes/deletedNote");

export const onNoteFocus = createAction("notes/onNoteFocus");
export const onNoteBlur = createAction("notes/onNoteBlur");
