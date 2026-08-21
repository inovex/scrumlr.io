import {Role} from "../../types/roles.ts"
import {RequestStatus} from "../../types/sessionRequest.ts"

export interface BoardSessionUpdateRequest {
  role?: Role;
  ready?: boolean;
  raisedHand?: boolean;
  banned?: boolean;
  favourite?: boolean;
  showHiddenColumns?: boolean;
}

export interface BoardSessionRequestUpdate {
  status: RequestStatus;
}
