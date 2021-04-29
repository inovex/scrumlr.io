import {JoinRequestClientModel} from "types/joinRequest";

export const JoinRequestActionType = {
  AcceptJoinRequests: "@@scrumlr/acceptJoinRequests" as const,
  RejectJoinRequests: "@@scrumlr/rejectJoinRequests" as const,
  InitializeJoinRequests: "@@scrumlr/initializeJoinRequests" as const,
  CreateJoinRequest: "@@scrumlr/createJoinRequest" as const,
  UpdateJoinRequest: "@@scrumlr/updateJoinRequest" as const,
};

export const JoinRequestActionFactory = {
  acceptJoinRequests: (boardId: string, userIds: string[]) => ({
    type: JoinRequestActionType.AcceptJoinRequests,
    boardId,
    userIds,
  }),
  rejectJoinRequests: (boardId: string, userIds: string[]) => ({
    type: JoinRequestActionType.RejectJoinRequests,
    boardId,
    userIds,
  }),
  initializeJoinRequests: (joinRequests: JoinRequestClientModel[]) => ({
    type: JoinRequestActionType.InitializeJoinRequests,
    joinRequests,
  }),
  createJoinRequest: (joinRequest: JoinRequestClientModel) => ({
    type: JoinRequestActionType.CreateJoinRequest,
    joinRequest,
  }),
  updateJoinRequest: (joinRequest: JoinRequestClientModel) => ({
    type: JoinRequestActionType.UpdateJoinRequest,
    joinRequest,
  }),
};

export type JoinRequestReduxAction =
  | ReturnType<typeof JoinRequestActionFactory.acceptJoinRequests>
  | ReturnType<typeof JoinRequestActionFactory.rejectJoinRequests>
  | ReturnType<typeof JoinRequestActionFactory.initializeJoinRequests>
  | ReturnType<typeof JoinRequestActionFactory.createJoinRequest>
  | ReturnType<typeof JoinRequestActionFactory.updateJoinRequest>;
