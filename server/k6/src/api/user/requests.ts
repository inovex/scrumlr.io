import type { Avatar } from "../../types/avatar.ts";

export interface UpdateUserRequest {
	name?: string;
	avatar?: Avatar;
}
