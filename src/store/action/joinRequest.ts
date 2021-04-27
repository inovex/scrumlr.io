import {JoinRequestClientModel} from "types/joinRequest";

export const JoinRequestActionType = {
  AcceptJoinRequest: "@@scrumlr/acceptJoinRequest" as const,
  RejectJoinRequest: "@@scrumlr/rejectJoinRequest" as const,
  AcceptAllPendingJoinRequests: "@@scrumlr/acceptAllPendingJoinRequests" as const,
  RejectAllPendingJoinRequests: "@@scrumlr/rejectAllPendingJoinRequests" as const,
  InitializeJoinRequests: "@@scrumlr/initializeJoinRequests" as const,
  CreateJoinRequest: "@@scrumlr/createJoinRequest" as const,
  UpdateJoinRequest: "@@scrumlr/updateJoinRequest" as const,
};

export const JoinRequestActionFactory = {
  acceptJoinRequest: (id: string, boardId: string, userId: string) => ({
    type: JoinRequestActionType.AcceptJoinRequest,
    id,
    boardId,
    userId,
  }),
  rejectJoinRequest: (id: string, boardId: string, userId: string) => ({
    type: JoinRequestActionType.RejectJoinRequest,
    id,
    boardId,
    userId,
  }),
  acceptAllPendingJoinRequests: (boardId: string) => ({
    type: JoinRequestActionType.AcceptAllPendingJoinRequests,
    boardId,
  }),
  rejectAllPendingJoinRequests: (boardId: string) => ({
    type: JoinRequestActionType.RejectAllPendingJoinRequests,
    boardId,
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
  | ReturnType<typeof JoinRequestActionFactory.acceptJoinRequest>
  | ReturnType<typeof JoinRequestActionFactory.rejectJoinRequest>
  | ReturnType<typeof JoinRequestActionFactory.acceptAllPendingJoinRequests>
  | ReturnType<typeof JoinRequestActionFactory.rejectAllPendingJoinRequests>
  | ReturnType<typeof JoinRequestActionFactory.initializeJoinRequests>
  | ReturnType<typeof JoinRequestActionFactory.createJoinRequest>
  | ReturnType<typeof JoinRequestActionFactory.updateJoinRequest>;
