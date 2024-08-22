import {createAction} from "@reduxjs/toolkit";
import {Board, EditBoardRequest} from "types/board";
import {Participant} from "types/participant";
import {Request} from "types/request";
import {Column} from "types/column";
import {Note} from "types/note";
import {Reaction} from "types/reaction";
import {Vote} from "types/vote";
import {Voting} from "types/voting";

type BoardActionType = {
  board: Board;
  participants: Participant[];
  requests: Request[];
  columns: Column[];
  notes: Note[];
  reactions: Reaction[];
  votes: Vote[];
  votings: Voting[];
};

// TODO possibly adjust payload types
export const leaveBoard = createAction("scrumlr.io/leaveBoard");
export const joinBoard = createAction("scrumlr.io/joinBoard");
export const initializeBoard = createAction<BoardActionType>("scrumlr.io/initializeBoard");
export const editBoard = createAction<EditBoardRequest>("scrumlr.io/editBoard");
export const updatedBoard = createAction<BoardActionType>("scrumlr.io/updatedBoard");
export const updatedBoardTimer = createAction<Board>("scrumlr.io/updatedBoardTimer");
export const deleteBoard = createAction("scrumlr.io/deleteBoard");
export const permittedBoardAccess = createAction<string>("scrumlr.io/permittedBoardAccess");
export const rejectedBoardAccess = createAction("scrumlr.io/rejectedBoardAccess");
export const pendingBoardAccessConfirmation = createAction<{board: string; requestReference: string}>("scrumlr.io/pendingBoardAccessConfirmation");
export const passphraseChallengeRequired = createAction("scrumlr.io/passphraseChallengeRequired");
export const incorrectPassphrase = createAction("scrumlr.io/incorrectPassphrase");
export const tooManyJoinRequests = createAction("scrumlr.io/tooManyJoinRequests");
export const bannedFromBoard = createAction("scrumlr.io/bannedFromBoard");
export const setTimer = createAction<number>("scrumlr.io/setTimer");
export const cancelTimer = createAction("scrumlr.io/cancelTimer");
export const incrementTimer = createAction("scrumlr.io/incrementTimer");

// const initialState: BoardState = {status: "unknown"};

/* TODO timer offset is required as context to update timer related stuff,
     but that is in *view* and therefore not available in the state.
     previously this was evaded by concatenating the action object with a context object. */

// const boardReducer = createReducer(initialState, builder => {
// builder
// .addCase(updatedBoardTimer, (state, action) => ({...state, data: {...state.data, timerStart: Timer.addOffsetToDate(action.board.timerStart, action.context.serverTimeOffset),
//     timerEnd: Timer.addOffsetToDate(action.board.timerEnd, action.payload.view.serverTimeOffset)}}))
// .addMatcher(isAnyOf(initializeBoard, updatedBoard), (state, action) => ({status: "ready", data: {...action.payload.board, timerStart: Timer.addOffsetToDate(action.payload.board.timerStart, action.payload.view.serverTimeOffset), timerEnd: Timer.addOffsetToDate(action.payload.board.timerEnd, state.data.)}}))//
// })
