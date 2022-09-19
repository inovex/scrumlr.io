import {Auth} from "./auth";

enum JoinRequestStatus {
  "PENDING" = 0,
  "ACCEPTED" = 1,
  "REJECTED" = 2,
}

type JoinRequestStatusType = keyof typeof JoinRequestStatus;

export type Request = {
  user: Auth;
  status: JoinRequestStatusType;
};

export type RequestsState = Request[];
