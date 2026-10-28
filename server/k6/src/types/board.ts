import type { AccessPolicy } from "./accessPolicy.ts";
import type { Column } from "./column.ts";
import type { Role } from "./roles.ts";

export interface Board {
	id: string;
	name: string;
	description?: string;
	accessPolicy: AccessPolicy;
	allowStacking: boolean;
	isLocked: boolean;
	showAuthors: boolean;
	showNoteReactions: boolean;
	showNotesOfOtherUsers: boolean;
	timerStart?: string;
	timerEnd?: string;
	sharedNote?: string | null;
	showVoting?: string | null;
	createdAt: string;
	lastModifiedAt: string;
}

export interface BoardOverview {
	board: Board;
	columns: Column[];
	createdAt: string;
	favourite: boolean;
	noteCount: number;
	participants: number;
	role: Role;
}
