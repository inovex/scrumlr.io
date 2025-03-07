import {Board} from "../board";
import {Column} from "../columns";
// import {Participant} from "../participants";
import {Request} from "../requests";
import {Note} from "../notes";
import {Reaction} from "../reactions";
import {Vote} from "../votes";
import {Voting} from "../votings";

// export type Session = {
//   id: string; // UUID
//   creator: string; // UUID
//   name: string;
//   description: string;
//   accessPolicy: AccessPolicy;
//   favourite: boolean;
//   columns: Column[];
// };

export type Session = {
  board: Board;
  columnsNumber: number;
  createdAt: string;
  participants: number;
  // participants: Participant[];
  requests: Request[];
  columns: Column[];
  notes: Note[];
  reactions: Reaction[];
  votes: Vote[];
  votings: Voting[];
  favourite: boolean;
  description: string; // TODO: do i find description in board type?
};

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

// used in store
export type SessionsState = Session[];
