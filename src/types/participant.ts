import {Auth} from "./auth";

export type ParticipantRole = "OWNER" | "MODERATOR" | "PARTICIPANT";

export interface Participant {
  user: Auth;
  connected: boolean;
  ready: boolean;
  raisedHand: boolean;
  viewsSharedNote: boolean;
  moderating: boolean;
  showHiddenColumns: boolean;
  role: ParticipantRole;
}

export type ParticipantsState = null | {
  others: Participant[];
  self: Participant;
  focusInitiator: Participant | null;
};
