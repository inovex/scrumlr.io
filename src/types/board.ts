export enum AccessPolicy {
  "PUBLIC" = 0,
  "BY_PASSPHRASE" = 1,
  "BY_INVITE" = 2,
}

export type AccessPolicyType = keyof typeof AccessPolicy;

export interface Board {
  id: string;

  name?: string;
  accessPolicy: keyof typeof AccessPolicy;
  showAuthors: boolean;
  showNotesOfOtherUsers: boolean;
  allowStacking: boolean;
  timerEnd?: string;

  sharedNote?: string;
  showVoting?: string;
}

export type EditBoardRequest = Partial<Omit<Board, "id">> & {passphrase?: string};

/* export const mapBoardServerToClientModel = async (board: Board): Promise<Board> => {
  if (board.timerEnd) {
     FIXME
    const difference = await getBrowserServerTimeDifference();
    timerUTCEndTime = new Date(new Date(board.timerUTCEndTime.iso).getTime() + difference);
  }

  return {
    id: board.id,
    name: board.name,
    accessPolicy: board.accessPolicy,
    showAuthors: board.showAuthors,
    showNotesOfOtherUsers: board.showNotesOfOtherUsers,
    allowStacking: board.allowStacking,
    timerEnd: board.timerEnd,
    sharedNote: board.sharedNote,
    showVoting: board.showVoting,
  };
}; */

export type BoardStatus = "unknown" | "pending" | "ready" | "rejected" | "accepted" | "passphrase_required" | "incorrect_passphrase";

export interface BoardState {
  status: BoardStatus;
  data?: Board;
}
