import {BoardClientModel} from "./board";
import {VoteClientModel} from "./vote";
import {UserState} from "./user";
import {JoinRequestClientModel} from "./joinRequest";
import {VotingState} from "./voting";
import {Column} from "./column";
import {ParticipantsState} from "./participant";
import {Note} from "./note";

export type BoardStatus = "unknown" | "pending" | "ready" | "rejected" | "accepted" | "passphrase_required" | "incorrect_passphrase";

export interface BoardState {
  status: BoardStatus;
  data?: BoardClientModel;
}

export interface ApplicationState {
  board: BoardState;
  columns: Column[];
  notes: Note[];
  user: UserState;
  participants: ParticipantsState;
  joinRequests: JoinRequestClientModel[];
  votes: VoteClientModel[];
  votings: VotingState;
}
