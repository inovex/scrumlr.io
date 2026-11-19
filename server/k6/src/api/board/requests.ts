import type { AccessPolicy } from "../../types/accessPolicy.ts";
import type { CreateColumnRequest } from "../column/requests.ts";

export interface CreateBoardRequest {
	name: string;
	description?: string;
	accessPolicy: AccessPolicy;
	passphrase?: string;
	columns: CreateColumnRequest[];
}

export interface UpdateBoardRequest {
	name?: string;
	description?: string;
	accessPolicy?: AccessPolicy;
	passphrase?: string;
	allowStacking?: boolean;
	isLocked?: boolean;
	showAuthors?: boolean;
	showNoteReactions?: boolean;
	showNotesOfOtherUsers?: boolean;
	timerStart?: string;
	timerEnd?: string;
	sharedNote?: { uuid: string; valid: boolean } | null;
	showVoting?: { uuid: string; valid: boolean } | null;
}

export interface JoinBoardRequest {
	passphrase?: string;
}

export interface SetTimerRequest {
	minutes: number;
}
