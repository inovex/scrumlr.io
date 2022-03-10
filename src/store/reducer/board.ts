/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {BoardState} from "types/board";
import {Action, ReduxAction} from "store/action";

// eslint-disable-next-line default-param-last
export const boardReducer = (state: BoardState = {status: "unknown"}, action: ReduxAction): BoardState => {
  switch (action.type) {
    case Action.InitializeBoard:
    case Action.UpdatedBoard: {
      return {
        status: "ready",
        data: action.board,
      };
    }

    case Action.DeleteBoard: {
      document.location.pathname = "/";
      return state;
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
    case Action.IncorrectPassphrase: {
      return {
        status: "incorrect_passphrase",
      };
    }
    default: {
      return state;
    }
  }
};
