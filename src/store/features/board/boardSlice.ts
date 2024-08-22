import {createAction} from "@reduxjs/toolkit";
import {Board} from "types/board";
import {Participant} from "types/participant";
import {Request} from "types/request";
import {Column} from "types/column";
import {Note} from "types/note";
import {Reaction} from "types/reaction";
import {Vote} from "types/vote";
import {Voting} from "types/voting";

/**
 * initializeBoard is the only action explicitly defined as such
 * because it's used in multiple reducers
 */
export const initializeBoard = createAction<{
  board: Board;
  participants: Participant[];
  requests: Request[];
  columns: Column[];
  notes: Note[];
  reactions: Reaction[];
  votes: Vote[];
  votings: Voting[];
}>("scrumlr.io/initializeBoard");
