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
      if (state.data) {
        if (action.payload.timerEnd) {
          state.data.timerStart = Timer.addOffsetToDate(action.payload.timerStart, store.getState().view.serverTimeOffset);
          state.data.timerEnd = Timer.addOffsetToDate(action.payload.timerEnd, store.getState().view.serverTimeOffset);
        } else {
          state.status = "ready";
          state.data.timerEnd = action.payload.timerEnd;
        }
      }
    })
    .addCase(permittedBoardAccess, (state) => {
      state.status = "accepted";
    })
    .addCase(rejectedBoardAccess, (state) => {
      state.status = "rejected";
    })
    .addCase(passphraseChallengeRequired, (state) => {
      state.status = "passphrase_required";
    })
    .addCase(incorrectPassphrase, (state) => {
      state.status = "incorrect_passphrase";
    })
    .addCase(tooManyJoinRequests, (state) => {
      state.status = "too_many_join_requests";
    })
    .addCase(bannedFromBoard, (state) => {
      state.status = "banned";
    })
    // TODO CreatedVoting
    // TODO UpdatedVoting
    // TODO DeletedNote
    .addMatcher(isAnyOf(initializeBoard, updatedBoard), (_state, action) => ({
      status: "ready",
      data: {
        ...action.payload.board,
        timerStart: Timer.addOffsetToDate(action.payload.board.timerStart, store.getState().view.serverTimeOffset),
        timerEnd: Timer.addOffsetToDate(action.payload.board.timerEnd, store.getState().view.serverTimeOffset),
      },
    }))
    .addMatcher(isAnyOf(joinBoard, pendingBoardAccessConfirmation), (state) => {
      state.status = "pending";
    });
});
