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
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showAuthors: boolean;
  timerUTCEndTime: Date;
  expirationUTCTime: Date;
  voting: "active" | "disabled";
  votingIteration: number;
  showVotesOfOtherUsers: boolean;
  showNotesOfOtherUsers: boolean;
  voteLimit: number;
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
  timerUTCEndTime: Date;
  expirationUTCTime: Date;
  voting: "active" | "disabled";
  votingIteration: number;
  showVotesOfOtherUsers: boolean;
  showNotesOfOtherUsers: boolean;
  voteLimit: number;
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
  accessCode: board.accessCode,
  joinConfirmationRequired: board.joinConfirmationRequired,
  encryptedContent: board.encryptedContent,
  showAuthors: board.showAuthors,
  timerUTCEndTime: board.timerUTCEndTime,
  expirationUTCTime: board.expirationUTCTime,
  voting: board.voting,
  votingIteration: board.votingIteration,
  showVotesOfOtherUsers: board.showVotesOfOtherUsers,
  showNotesOfOtherUsers: board.showNotesOfOtherUsers,
  voteLimit: board.voteLimit,
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
  dirty: false,
  // @ts-ignore
  owner: board.owner.objectId,
});
