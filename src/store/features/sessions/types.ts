import {AccessPolicy} from "../board";
import {Column} from "../columns";

// getTemplates returns all templates with columns, but is the only endpoint to do so.
// All other template / column endpoints are handled separately, i.e. getting/updating a template
// does not return the associated columns.
// Thus, it's important to be aware of this to avoid inconsistencies in the store.

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
