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
  createdAt: Date;
  updatedAt: Date;
}

export type EditableBoardAttributes = {
  name: string;
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showContentOfOtherUsers: boolean;
  showAuthors: boolean;
  timerUTCEndTime: Date;
  expirationUTCTime: Date;
  voting: "active" | "disabled";
};

export type EditBoardRequest = {id: string} & Partial<EditableBoardAttributes>;

export interface BoardClientModel extends EditableBoardAttributes {
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
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
  dirty: false,
});
