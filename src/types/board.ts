import {Color} from "constants/colors";

export interface BoardServerModel {
  objectId: string;
  name: string;
  columns: {
    [columnId: string]: {
      name: string;
      color: string;
      hidden: boolean;
    };
  };
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showContentOfOtherUsers: boolean;
  showAuthors: boolean;
  timerUTCEndTime: Date;
  expirationUTCTime: Date;
  voting: "active" | "disabled";
  showVotesOfOtherUsers: boolean;
  voteLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditableBoardClientModel {
  name: string;
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showContentOfOtherUsers: boolean;
  showAuthors: boolean;
  timerUTCEndTime: Date;
  expirationUTCTime: Date;
  voting: "active" | "disabled";
  showVotesOfOtherUsers: boolean;
  voteLimit: number;
}

export interface BoardClientModel extends EditableBoardClientModel {
  id: string;
  columns: {
    id?: string;
    name: string;
    color: Color;
    hidden: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
  dirty: boolean;
}

export const mapBoardServerToClientModel = (board: BoardServerModel): BoardClientModel => ({
  id: board.objectId,
  name: board.name,
  columns: Object.keys(board.columns).map((columnId) => ({
    id: columnId,
    name: board.columns[columnId].name,
    color: board.columns[columnId].color as Color,
    hidden: board.columns[columnId].hidden,
  })),
  accessCode: board.accessCode,
  joinConfirmationRequired: board.joinConfirmationRequired,
  encryptedContent: board.encryptedContent,
  showContentOfOtherUsers: board.showContentOfOtherUsers,
  showAuthors: board.showAuthors,
  timerUTCEndTime: board.timerUTCEndTime,
  expirationUTCTime: board.expirationUTCTime,
  voting: board.voting,
  showVotesOfOtherUsers: board.showVotesOfOtherUsers,
  voteLimit: board.voteLimit,
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
  dirty: false,
});
