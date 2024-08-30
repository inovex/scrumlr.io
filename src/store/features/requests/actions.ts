import {Request} from "types/request";

export const RequestAction = {
  AcceptJoinRequests: "scrumlr.io/acceptJoinRequests" as const,
  RejectJoinRequests: "scrumlr.io/rejectJoinRequests" as const,
  InitializeJoinRequests: "scrumlr.io/initializeJoinRequests" as const,
  CreateJoinRequest: "scrumlr.io/createJoinRequest" as const,
  UpdateJoinRequest: "scrumlr.io/updateJoinRequest" as const,
};

export const RequestActionFactory = {
  acceptJoinRequests: (userIds: string[]) => ({
    type: RequestAction.AcceptJoinRequests,
    userIds,
  }),
  rejectJoinRequests: (userIds: string[]) => ({
    type: RequestAction.RejectJoinRequests,
    userIds,
  }),
  initializeJoinRequests: (requests: Request[]) => ({
    type: RequestAction.InitializeJoinRequests,
    joinRequests: requests,
  }),
  createJoinRequest: (joinRequest: Request) => ({
    type: RequestAction.CreateJoinRequest,
    joinRequest,
  }),
  updateJoinRequest: (joinRequest: Request) => ({
    type: RequestAction.UpdateJoinRequest,
    joinRequest,
  }),
};

export type RequestReduxAction =
  | ReturnType<typeof RequestActionFactory.acceptJoinRequests>
  | ReturnType<typeof RequestActionFactory.rejectJoinRequests>
  | ReturnType<typeof RequestActionFactory.initializeJoinRequests>
  | ReturnType<typeof RequestActionFactory.createJoinRequest>
  | ReturnType<typeof RequestActionFactory.updateJoinRequest>;
