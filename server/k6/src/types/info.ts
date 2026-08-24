import type { AccountType } from "./account.ts";

export interface Info {
	serverTime: string;
	feedbackEnabled: boolean;
	allowAnonymousBoardCreation: boolean;
	allowAnonymousCustomTemplates: boolean;
	allowAnonymousHistory: boolean;
	anonymousLoginDisabled: boolean;
	authProvider?: AccountType[];
}
