import {Participant} from "../../features/participants/types";
import {Request} from "../../features/requests/types";
import {Column} from "../../features/columns/types";
import {Note} from "../../features/notes/types";
import {Reaction} from "../../features/reactions/types";
import {Vote} from "../../features/votes/types";
import {Voting} from "../../features/votings/types";

export enum AccessPolicy {
  "PUBLIC" = 0,
  "BY_PASSPHRASE" = 1,
  "BY_INVITE" = 2,
}

export interface Board {
  id: string;

  name?: string;
  accessPolicy: keyof typeof AccessPolicy;
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

export type EditBoardRequest = Partial<Omit<Board, "id">> & {passphrase?: string};

export type BoardStatus = "unknown" | "pending" | "ready" | "rejected" | "accepted" | "passphrase_required" | "incorrect_passphrase" | "too_many_join_requests" | "banned";

export interface BoardState {
  status: BoardStatus;
  data?: Board;
}
