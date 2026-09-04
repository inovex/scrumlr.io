import type { AccountType } from "./account.ts";
import type { Avatar } from "./avatar.ts";

export interface User {
	id: string;
	name: string;
	accountType: AccountType;
	avatar?: Avatar;
}
