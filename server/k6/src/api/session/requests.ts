import type { Role } from "../../types/roles.ts";

export interface BoardSessionUpdateRequest {
	role?: Role;
	ready?: boolean;
	raisedHand?: boolean;
	banned?: boolean;
	favourite?: boolean;
	showHiddenColumns?: boolean;
}

export interface BoardSessionsUpdateRequest {
	ready?: boolean;
	raisedHand?: boolean;
}
