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
  allowEditing: boolean;
  timerStart?: Date;
  timerEnd?: Date;

  sharedNote?: string;
  showVoting?: string;
}

export type EditBoardRequest = Partial<Omit<Board, "id">> & {passphrase?: string};

export type BoardStatus = "unknown" | "pending" | "ready" | "rejected" | "accepted" | "passphrase_required" | "incorrect_passphrase" | "too_many_join_requests";

export interface BoardState {
  status: BoardStatus;
  data?: Board;
}
