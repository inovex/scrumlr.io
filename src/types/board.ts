import {Color} from "constants/colors";
import Parse from "parse";
import {ColumnClientModel, ColumnServerModel} from "types/column";
import {UserConfigurationClientModel, UserConfigurationServerModel} from "./user";

export interface BoardServerModel {
  objectId: string;
  name: string;
  columns: ColumnServerModel;
  userConfigurations: UserConfigurationServerModel;
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showAuthors: boolean;
  timerUTCEndTime?: Date;
  expirationUTCTime: Date;
  voting: "active" | "disabled";
  moderation: {userId?: string; status: "active" | "disabled"};
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
  moderation: {userId?: string; status: "active" | "disabled"};
  votingIteration: number;
  showNotesOfOtherUsers: boolean;
};

export type UserConfiguration = {
  showHiddenColumns: boolean;
};

export type EditBoardRequest = {id: string} & Partial<EditableBoardAttributes & {userConfiguration: UserConfiguration}>;

export interface BoardClientModel extends EditableBoardAttributes {
  id: string;
  columns: ColumnClientModel[];
  userConfigurations: UserConfigurationClientModel[];
  createdAt: Date;
  updatedAt: Date;
  dirty: boolean;
  owner: any;
}

export const mapBoardServerToClientModel = (board: BoardServerModel): BoardClientModel => ({
  id: board.objectId,
  name: board.name,
  columns: Object.keys(board.columns).map(
    (columnId) =>
      ({
        columnId,
        name: board.columns[columnId].name,
        color: board.columns[columnId].color as Color,
        hidden: board.columns[columnId].hidden,
      } as ColumnClientModel)
  ),
  userConfigurations: Object.keys(board.userConfigurations).map(
    (id) =>
      ({
        id,
        showHiddenColumns: board.userConfigurations[id].showHiddenColumns,
      } as UserConfigurationClientModel)
  ),
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
  moderation: board.moderation,
});
