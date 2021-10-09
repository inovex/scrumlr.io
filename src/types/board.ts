import {Color} from "constants/colors";
import {ColumnClientModel, ColumnServerModel} from "types/column";
import {UserConfigurationClientModel, UserConfigurationServerModel} from "./user";
import {getBrowserServerTimeDifference} from "../utils/timer";

export interface BoardServerModel {
  objectId: string;
  name: string;
  columns: ColumnServerModel;
  userConfigurations: UserConfigurationServerModel;
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showAuthors: boolean;
  timerUTCEndTime: {
    iso: string;
  };
  voting: "active" | "disabled";
  moderation: {userId?: string; status: "active" | "disabled"};
  votingIteration: number;
  showNotesOfOtherUsers: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    objectId: string;
  };
}

export type EditableBoardAttributes = {
  name: string;
  accessCode: string;
  joinConfirmationRequired: boolean;
  encryptedContent: boolean;
  showAuthors: boolean;
  timerUTCEndTime?: Date;
  voting: "active" | "disabled";
  moderation: {userId?: string; status: "active" | "disabled"};
  votingIteration: number;
  showNotesOfOtherUsers: boolean;
};

export type EditBoardRequest = {id: string} & Partial<EditableBoardAttributes>;

export interface BoardClientModel extends EditableBoardAttributes {
  id: string;
  columns: ColumnClientModel[];
  userConfigurations: UserConfigurationClientModel[];
  createdAt: Date;
  updatedAt: Date;
  dirty: boolean;
  owner: string;
}

export const mapBoardServerToClientModel = async (board: BoardServerModel): Promise<BoardClientModel> => {
  let timerUTCEndTime;
  if (board.timerUTCEndTime != null) {
    const difference = await getBrowserServerTimeDifference();
    timerUTCEndTime = new Date(new Date(board.timerUTCEndTime.iso).getTime() + difference);
  }

  return {
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
    timerUTCEndTime,
    voting: board.voting,
    votingIteration: board.votingIteration,
    showNotesOfOtherUsers: board.showNotesOfOtherUsers,
    createdAt: new Date(board.createdAt),
    updatedAt: new Date(board.updatedAt),
    dirty: false,
    owner: board.owner.objectId,
    moderation: board.moderation,
  };
};
