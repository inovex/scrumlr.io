import {User} from "./user";
import {Participant} from "../components/BoardHeader/ParticipantsList/Participant";

export type ParticipantRole = "OWNER" | "MODERATOR" | "PARTICIPANT";

export interface Participant {
  user: User;
  connected: boolean;
  ready: boolean;
  raisedHand: boolean;
  showHiddenColumns: boolean;
  role: ParticipantRole;
}

export type ParticipantsState =
  | undefined
  | {
      participants: Participant[];
      self: Participant;
    };
