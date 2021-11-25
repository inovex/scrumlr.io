import {Color} from "constants/colors";
import {ColumnClientModel, ColumnServerModel} from "types/column";
import {getBrowserServerTimeDifference} from "utils/timer";
import {UserConfigurationClientModel, UserConfigurationServerModel} from "./user";

export enum AccessPolicy {
  "Public" = 0,
  "ByPassphrase" = 1,
  "ManualVerification" = 2,
}

export type AccessPolicyType = keyof typeof AccessPolicy;

export interface BoardServerModel {
  objectId: string;
  name: string;
  columns: ColumnServerModel;
  userConfigurations: UserConfigurationServerModel;
  accessCode: string;
  accessPolicy: {
    type: AccessPolicyType;
    salt?: string;
    passphrase?: string;
  };
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
  usersMarkedReady: string[];
  usersRaisedHands: string[];
}

export type EditableBoardAttributes = {
  name: string;
  accessCode: string;
  accessPolicy: {
    type: AccessPolicyType;
    passphrase?: string;
  };
  encryptedContent: boolean;
  showAuthors: boolean;
  timerUTCEndTime?: Date;
  voting: "active" | "disabled";
  moderation: {userId?: string; status: "active" | "disabled"};
  votingIteration: number;
  showNotesOfOtherUsers: boolean;
};

export type EditBoardRequest = {id: string} & Partial<EditableBoardAttributes>;

export interface BoardClientModel extends Omit<EditableBoardAttributes, "accessPolicy"> {
  id: string;
  columns: ColumnClientModel[];
  userConfigurations: UserConfigurationClientModel[];
  accessPolicy: AccessPolicyType;
  createdAt: Date;
  updatedAt: Date;
  usersMarkedReady: string[];
  usersRaisedHands: string[];
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
    accessPolicy: board.accessPolicy.type,
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
    usersMarkedReady: board.usersMarkedReady,
    usersRaisedHands: board.usersRaisedHands,
  };
};
