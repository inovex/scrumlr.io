import {Participant} from "../participants";
import {Request} from "../requests";
import {Column} from "../columns";
import {Note} from "../notes";
import {Reaction} from "../reactions";
import {Vote} from "../votes";
import {Voting} from "../votings";

export type AccessPolicy = "PUBLIC" | "BY_PASSPHRASE" | "BY_INVITE";

// smart type which comes with a passphrase for the respective access policy
export type CreateSessionAccessPolicy = {policy: Extract<AccessPolicy, "PUBLIC" | "BY_INVITE">} | {policy: Extract<AccessPolicy, "BY_PASSPHRASE">; passphrase: string};

export interface Board {
  id: string;

  name?: string;
  accessPolicy: AccessPolicy;
  showAuthors: boolean;
  showNotesOfOtherUsers: boolean;
  showNoteReactions: boolean;
  allowStacking: boolean;
  isLocked: boolean;
  timerStart?: Date;
  timerEnd?: Date;

  sharedNote?: string;
  showVoting?: string;
}

export type BoardImportData = {
  board: {
    name: string;
    description?: string;
    accessPolicy: string;
    passphrase?: string;
  };
  columns: Column[];
  notes: Note[];
  participants: Participant;
  voting: Voting;
};

export type BoardActionType = {
  board: Board;
  participants: Participant[];
  requests: Request[];
  columns: Column[];
  notes: Note[];
  reactions: Reaction[];
  votes: Vote[];
  votings: Voting[];
};

export type BoardWithServerTimeOffset = {board: Board; serverTimeOffset: number};

export type EditBoardRequest = Partial<Omit<Board, "id">> & {passphrase?: string};

export type BoardStatus = "unknown" | "pending" | "ready" | "rejected" | "accepted" | "passphrase_required" | "incorrect_passphrase" | "too_many_join_requests" | "banned";

export interface BoardState {
  status: BoardStatus;
  data?: Board;
}
