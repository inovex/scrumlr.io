import {createReducer, isAnyOf} from "@reduxjs/toolkit";
import {Board, BoardState} from "store/features/board/types";
import {Timer} from "utils/timer";
import {
  bannedFromBoard,
  incorrectPassphrase,
  initializeBoard,
  passphraseChallengeRequired,
  rejectedBoardAccess,
  tooManyJoinRequests,
  updatedBoard,
  updatedBoardTimer,
} from "./actions";
import {permittedBoardAccess} from "./thunks";
import {joinBoard, pendingBoardAccessConfirmation} from "../requests";

const initialState: BoardState = {status: "unknown"};

const createUpdatedBoardState = (board: Board, serverTimeOffset: number): BoardState => ({
  status: "ready",
  data: {
    ...board,
    timerStart: Timer.addOffsetToDate(board.timerStart, serverTimeOffset),
    timerEnd: Timer.addOffsetToDate(board.timerEnd, serverTimeOffset),
  },
});

export const boardReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(initializeBoard, (_state, action) => createUpdatedBoardState(action.payload.fullBoard.board, action.payload.serverTimeOffset))
    .addCase(updatedBoard, (_state, action) => createUpdatedBoardState(action.payload.board, action.payload.serverTimeOffset))
    .addCase(updatedBoardTimer, (state, action) => {
      if (state.data) {
        if (action.payload.board.timerEnd) {
          state.data.timerStart = Timer.addOffsetToDate(action.payload.board.timerStart, action.payload.serverTimeOffset);
          state.data.timerEnd = Timer.addOffsetToDate(action.payload.board.timerEnd, action.payload.serverTimeOffset);
        } else {
          state.status = "ready";
          state.data.timerEnd = action.payload.board.timerEnd;
        }
      }
    })
    .addCase(permittedBoardAccess.fulfilled, (state) => {
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
    .addMatcher(isAnyOf(joinBoard.pending, pendingBoardAccessConfirmation.pending), (state) => {
      state.status = "pending";
    });
});
