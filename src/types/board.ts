import {Color} from "constants/colors";
import Parse from "parse";

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
  userSettings: {
    [userId: string]: {};
  };
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showAuthors: boolean;
  timerUTCEndTime?: Date;
  expirationUTCTime: Date;
  voting: "active" | "disabled";
  votingIteration: number;
  showNotesOfOtherUsers: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: Parse.Object;
}

export type EditableBoardAttributes = {
  name: string;
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showAuthors: boolean;
  timerUTCEndTime?: Date;
  expirationUTCTime: Date;
  voting: "active" | "disabled";
  votingIteration: number;
  showNotesOfOtherUsers: boolean;
};

export type UserSetting = {
  id: string;
};

export type EditBoardRequest = {id: string} & Partial<EditableBoardAttributes & {userSetting: UserSetting}>;

export interface BoardClientModel extends EditableBoardAttributes {
  id: string;
  columns: {
    id?: string;
    name: string;
    color: Color;
    hidden: boolean;
  }[];
  userSettings: {
    id: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  dirty: boolean;
  owner: any;
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
  userSettings: Object.keys(board.userSettings).map((userId) => ({
    id: userId,
  })),
  accessCode: board.accessCode,
  joinConfirmationRequired: board.joinConfirmationRequired,
  encryptedContent: board.encryptedContent,
  showAuthors: board.showAuthors,
  timerUTCEndTime: board.timerUTCEndTime,
  expirationUTCTime: board.expirationUTCTime,
  voting: board.voting,
  votingIteration: board.votingIteration,
  showNotesOfOtherUsers: board.showNotesOfOtherUsers,
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
  dirty: false,
  // @ts-ignore
  owner: board.owner.objectId,
});
