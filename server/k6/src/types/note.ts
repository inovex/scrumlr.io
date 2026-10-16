export interface Note {
	id: string;
	author: string;
	text: string;
	edited: boolean;
	position: NotePosition;
}

export interface NotePosition {
	column: string;
	stack?: { uuid: string; valid: boolean } | null;
	rank: number;
}
