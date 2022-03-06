import {Auth} from "./auth";
import {Participant} from "../components/BoardHeader/ParticipantsList/Participant";

export type ParticipantRole = "OWNER" | "MODERATOR" | "PARTICIPANT";

export interface Participant {
  user: Auth;
  connected: boolean;
  ready: boolean;
  raisedHand: boolean;
  showHiddenColumns: boolean;
  role: ParticipantRole;
}

export type ParticipantsState = null | {
  participants: Participant[];
  self: Participant;
};
