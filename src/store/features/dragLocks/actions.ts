import {createAction} from "@reduxjs/toolkit";
import {NoteDragEvent} from "./types";

export const noteDragStarted = createAction<NoteDragEvent>("dragLocks/noteDragStarted");
export const noteDragEnded = createAction<NoteDragEvent>("dragLocks/noteDragEnded");
