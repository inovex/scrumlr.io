import { AccountType } from "./account.ts";
import { Avatar } from "./avatar.ts";

export interface User {
  id: string;
  name: string;
  accountType: AccountType;
  avatar?: Avatar;
}



