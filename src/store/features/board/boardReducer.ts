import {createAction, createReducer, isAnyOf} from "@reduxjs/toolkit";
import {Board, BoardState, EditBoardRequest} from "types/board";
import {Participant} from "types/participant";
import {Request} from "types/request";
import {Column} from "types/column";
import {Note} from "types/note";
import {Reaction} from "types/reaction";
import {Vote} from "types/vote";
import {Voting} from "types/voting";
import store from "store";
import {Timer} from "utils/timer";

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

const initialState: BoardState = {status: "unknown"};

const boardReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(updatedBoardTimer, (state, action) => {
      // state may be mutated directly because Immer is used internally https://redux-toolkit.js.org/usage/immer-reducers
      if (action.payload.timerEnd) {
        return {
          ...state,
          data: {
            ...state.data!,
            timerStart: Timer.addOffsetToDate(action.payload.timerStart, store.getState().view.serverTimeOffset),
            timerEnd: Timer.addOffsetToDate(action.payload.timerEnd, store.getState().view.serverTimeOffset),
          },
        };
      }
      return {
        status: "ready",
        data: {
          ...state.data!,
          timerEnd: action.payload.timerEnd,
        },
      };
    })
    .addCase(permittedBoardAccess, () => ({status: "accepted"}))
    .addCase(rejectedBoardAccess, () => ({status: "rejected"}))
    .addCase(passphraseChallengeRequired, () => ({status: "passphrase_required"}))
    .addCase(incorrectPassphrase, () => ({status: "incorrect_passphrase"}))
    .addCase(tooManyJoinRequests, () => ({status: "too_many_join_requests"}))
    .addCase(bannedFromBoard, () => ({status: "banned"}))
    // TODO CreatedVoting
    // TODO UpdatedVoting
    // TODO DeletedNote
    .addMatcher(isAnyOf(initializeBoard, updatedBoard), (_, action) => ({
      status: "ready",
      data: {
        ...action.payload.board,
        timerStart: Timer.addOffsetToDate(action.payload.board.timerStart, store.getState().view.serverTimeOffset),
        timerEnd: Timer.addOffsetToDate(action.payload.board.timerEnd, store.getState().view.serverTimeOffset),
      },
    }))
    .addMatcher(isAnyOf(joinBoard, pendingBoardAccessConfirmation), () => ({status: "pending"}));
});
