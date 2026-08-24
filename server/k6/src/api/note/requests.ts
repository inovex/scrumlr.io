import type { NotePosition } from "../../types/note.ts";

export interface CreateNoteRequest {
	column: string;
	text: string;
}

export interface UpdateNoteRequest {
	text?: string;
	position?: NotePosition;
}

export interface DeleteNoteRequest {
	deleteStack?: boolean;
}
