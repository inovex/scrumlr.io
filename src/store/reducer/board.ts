/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {BoardState} from "types/board";
import {ActionType, ReduxAction} from "store/action";

// eslint-disable-next-line default-param-last
export const boardReducer = (state: BoardState = {status: "unknown"}, action: ReduxAction): BoardState => {
  switch (action.type) {
    case ActionType.InitializeBoard: {
      return {
        status: "ready",
        data: action.board,
      };
    }

    case ActionType.DeleteBoard: {
      document.location.pathname = "/";
      return state;
    }

    case ActionType.PendingBoardAccessConfirmation:
    case ActionType.JoinBoard: {
      return {
        status: "pending",
      };
    }
    case ActionType.PermittedBoardAccess: {
      return {
        status: "accepted",
      };
    }
    case ActionType.RejectedBoardAccess: {
      return {
        status: "rejected",
      };
    }
    case ActionType.PassphraseChallengeRequired: {
      return {
        status: "passphrase_required",
      };
    }
    case ActionType.IncorrectPassphrase: {
      return {
        status: "incorrect_passphrase",
      };
    }
    default: {
      return state;
    }
  }
};
