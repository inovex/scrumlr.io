import {BoardClientModel} from "./board";
import {NoteClientModel} from "./note";
import {VoteClientModel} from "./vote";
import {UserClientModel} from "./user";
import {JoinRequestClientModel} from "./joinRequest";
import {VoteConfigurationClientModel} from "./voteConfiguration";

export type BoardStatus = "unknown" | "pending" | "ready" | "rejected" | "accepted" | "passphrase_required" | "incorrect_passphrase";

export interface BoardState {
  status: BoardStatus;
  data?: BoardClientModel;
}

export interface UsersState {
  usersMarkedReady: string[];
  admins: UserClientModel[];
  basic: UserClientModel[];
  all: UserClientModel[];
}

export interface ApplicationState {
  board: BoardState;
  notes: NoteClientModel[];
  users: UsersState;
  joinRequests: JoinRequestClientModel[];
  votes: VoteClientModel[];
  voteConfiguration: VoteConfigurationClientModel;
}
