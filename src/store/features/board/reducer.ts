import {createReducer, isAnyOf} from "@reduxjs/toolkit";
import {BoardState} from "types/board";
import store from "store";
import {Timer} from "utils/timer";
import {
  bannedFromBoard,
  incorrectPassphrase,
  initializeBoard,
  joinBoard,
  passphraseChallengeRequired,
  pendingBoardAccessConfirmation,
  permittedBoardAccess,
  rejectedBoardAccess,
  tooManyJoinRequests,
  updatedBoard,
  updatedBoardTimer,
} from "./actions";

const initialState: BoardState = {status: "unknown"};

export const boardReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(updatedBoardTimer, (state, action) => {
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
