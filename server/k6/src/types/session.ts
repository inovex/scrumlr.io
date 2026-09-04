import type { Role } from "./roles.ts";

export interface BoardSession {
	id: string;
	role: Role;
	ready: boolean;
	raisedHand: boolean;
	banned: boolean;
	favourite: boolean;
	connected: boolean;
	showHiddenColumns: boolean;
	createdAt: string;
}
