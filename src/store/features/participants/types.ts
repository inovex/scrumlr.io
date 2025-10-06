import {Auth} from "../auth";

export type ParticipantRole = "OWNER" | "MODERATOR" | "PARTICIPANT";

export interface ParticipantWithUser {
  user: Auth;
  connected: boolean;
  ready: boolean;
  raisedHand: boolean;
  showHiddenColumns: boolean;
  role: ParticipantRole;
  banned?: boolean;
}

export interface ParticipantWithUserId {
  id: string;
  connected: boolean;
  ready: boolean;
  raisedHand: boolean;
  showHiddenColumns: boolean;
  role: ParticipantRole;
  banned?: boolean;
}

export type ParticipantsState = {
  self?: ParticipantWithUser;
  others?: ParticipantWithUser[];
  focusInitiator?: ParticipantWithUser;
};

export type ParticipantExtendedInfo = ParticipantWithUser & {displayName: string; isSelf: boolean};
