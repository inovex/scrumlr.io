export enum AccessPolicy {
  "PUBLIC" = 0,
  "BY_PASSPHRASE" = 1,
  "BY_INVITE" = 2,
}

export type AccessPolicyType = keyof typeof AccessPolicy;

export interface BoardServerModel {
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

export type EditableBoardAttributes = {
  name?: string;
  accessPolicy: {
    type: AccessPolicyType;
    passphrase?: string;
  };
  showAuthors: boolean;
  showNotesOfOtherUsers: boolean;
  allowStacking: boolean;
  timerUTCEndTime?: Date;

  sharedNote?: string;
  showVoting?: string;
};

export type EditBoardRequest = {id: string} & Partial<EditableBoardAttributes>;

export interface BoardClientModel extends Omit<EditableBoardAttributes, "accessPolicy"> {
  id: string;
  accessPolicy: AccessPolicyType;
}

export const mapBoardServerToClientModel = async (board: BoardServerModel): Promise<BoardClientModel> => {
  const timerUTCEndTime = undefined;
  if (board.timerEnd) {
    /* FIXME
    const difference = await getBrowserServerTimeDifference();
    timerUTCEndTime = new Date(new Date(board.timerUTCEndTime.iso).getTime() + difference);
    */
  }

  return {
    id: board.id,
    name: board.name,
    accessPolicy: board.accessPolicy,
    showAuthors: board.showAuthors,
    showNotesOfOtherUsers: board.showNotesOfOtherUsers,
    allowStacking: board.allowStacking,
    timerUTCEndTime,
    sharedNote: board.sharedNote,
    showVoting: board.showVoting,
  };
};
