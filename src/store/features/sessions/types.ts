import {AccessPolicy} from "../board";
import {Column} from "../columns";

export type Session = {
  id: string; // UUID
  creator: string; // UUID
  name: string;
  description: string;
  accessPolicy: AccessPolicy;
  favourite: boolean;
  columns: Column[];
};

// TODO: which of these do I need?
// export interface Board {
//   id: string;
//
//   name?: string;
//   accessPolicy: AccessPolicy;
//   showAuthors: boolean;
//   showNotesOfOtherUsers: boolean;
//   showNoteReactions: boolean;
//   allowStacking: boolean;
//   isLocked: boolean;
//   timerStart?: Date;
//   timerEnd?: Date;
//
//   sharedNote?: string;
//   showVoting?: string;
// }
//
// export type BoardImportData = {
//   board: {
//     name: string;
//     description?: string;
//     accessPolicy: string;
//     passphrase?: string;
//   };
//   columns: Column[];
//   notes: Note[];
//   participants: Participant;
//   voting: Voting;
// };

// used in store
export type SessionsState = Session[];
