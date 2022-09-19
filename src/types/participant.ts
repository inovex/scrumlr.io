import {Auth} from "./auth";

type ParticipantRole = "OWNER" | "MODERATOR" | "PARTICIPANT";

export type Participant = {
  user: Auth;
  connected: boolean;
  ready: boolean;
  raisedHand: boolean;
  showHiddenColumns: boolean;
  role: ParticipantRole;
};

export type ParticipantsState = null | {
  others: Participant[];
  self: Participant;
};
