import {Auth} from "./auth";

export type ParticipantRole = "OWNER" | "MODERATOR" | "PARTICIPANT";

export interface Participant {
  user: Auth;
  connected: boolean;
  ready: boolean;
  raisedHand: boolean;
  showHiddenColumns: boolean;
  role: ParticipantRole;
  banned?: boolean;
}

export type ParticipantsState = null | {
  others: Participant[];
  self: Participant;
  focusInitiator?: Participant;
};

export type ParticipantExtendedInfo = Participant & {displayName: string; isSelf: boolean};
