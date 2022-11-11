import {Participant} from "./participant";

export interface Focus {
  initiator: Participant | null;
}

export type FocusState = Focus;
