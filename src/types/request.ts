import {Auth} from "./auth";

export enum JoinRequestStatus {
  "PENDING" = 0,
  "ACCEPTED" = 1,
  "REJECTED" = 2,
}

export type JoinRequestStatusType = keyof typeof JoinRequestStatus;

export interface Request {
  user: Auth;
  status: JoinRequestStatusType;
}

export type RequestsState = Request[];
