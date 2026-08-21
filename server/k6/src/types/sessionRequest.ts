import {User} from "./users.ts"

export type RequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export interface BoardSessionRequest {
  user: User;
  status: RequestStatus;
}
