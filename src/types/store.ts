import {BoardClientModel} from "./board";
import {NoteClientModel} from "./note";
import {VoteClientModel} from "./vote";
import {UserClientModel} from "./user";
import {JoinRequestClientModel} from "./joinRequest";
import {VoteConfigurationClientModel} from "./voteConfiguration";

export interface BoardState {
  status: "unknown" | "pending" | "ready" | "rejected" | "accepted" | "passphrase_required" | "incorrect_passphrase";
  data?: BoardClientModel;
}

export interface UsersState {
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
