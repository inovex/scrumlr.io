/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Action, ReduxAction} from "store/action";
import {BoardState} from "types/board";
import {Timer} from "utils/timer";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const boardReducer = (state: BoardState = {status: "unknown"}, action: ReduxAction): BoardState => {
  switch (action.type) {
    case Action.InitializeBoard:
    case Action.UpdatedBoard: {
      return {
        status: "ready",
        data: {
          ...action.board,
          timerStart: Timer.addOffsetToDate(action.board.timerStart, action.context.serverTimeOffset),
          timerEnd: Timer.addOffsetToDate(action.board.timerEnd, action.context.serverTimeOffset),
        },
      };
    }
    case Action.UpdatedBoardTimer: {
      if (action.board.timerEnd) {
        return {
          ...state,
          data: {
            ...state.data!,
            timerStart: Timer.addOffsetToDate(action.board.timerStart, action.context.serverTimeOffset),
            timerEnd: Timer.addOffsetToDate(action.board.timerEnd, action.context.serverTimeOffset),
          },
        };
      }
      return {
        status: "ready",
        data: {...state.data!, timerEnd: action.board.timerEnd},
      };
    }
    case Action.PendingBoardAccessConfirmation:
    case Action.JoinBoard: {
      return {
        status: "pending",
      };
    }
    case Action.PermittedBoardAccess: {
      return {
        status: "accepted",
      };
    }
    case Action.RejectedBoardAccess: {
      return {
        status: "rejected",
      };
    }
    case Action.PassphraseChallengeRequired: {
      return {
        status: "passphrase_required",
      };
    }
    case Action.TooManyJoinRequests: {
      return {
        status: "too_many_join_requests",
      };
    }
    case Action.CreatedVoting: {
      // reset show voting, since websocket messages won't trigger update of board
      return {
        status: state.status,
        data: {
          ...state.data!,
          showVoting: undefined,
        },
      };
    }

    case Action.UpdatedVoting: {
      // show new voting results, since websocket messages won't trigger update of board
      if (action.voting.status === "CLOSED") {
        return {
          status: state.status,
          data: {
            ...state.data!,
            showVoting: action.voting.id,
          },
        };
      }
      return state;
    }

    case Action.DeletedNote: {
      if (action.note.id === state.data?.sharedNote) {
        return {
          status: state.status,
          data: {
            ...state.data!,
            sharedNote: undefined,
          },
        };
      }
      return state;
    }

    default: {
      return state;
    }
  }
};
