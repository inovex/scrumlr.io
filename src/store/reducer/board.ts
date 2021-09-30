/* eslint-disable @typescript-eslint/no-non-null-assertion */
import isEqual from "lodash/isEqual";
import {BoardState} from "types/store";
import {ActionType, ReduxAction} from "store/action";
import {Toast} from "utils/Toast";
import Parse from "parse";

export const boardReducer = (state: BoardState = {status: "unknown"}, action: ReduxAction): BoardState => {
  switch (action.type) {
    case ActionType.InitializeBoard: {
      return {
        status: "ready",
        data: action.board,
      };
    }
    case ActionType.EditBoard: {
      // Moderator started voting phase - notification to moderator (user who started the voting)
      if (action.board.voting) {
        Toast.success(`You ${action.board.voting === "active" ? "started" : "ended"} the voting phase!`);
      }
      action.board;
      const {userConfiguration, ...actions} = action.board;

      const newState = {
        status: state.status,
        data: {
          ...state.data!,
          ...actions,
          dirty: true,
        },
      };

      if (userConfiguration) {
        const setting = newState.data.userConfigurations.find((user) => user.id === Parse.User.current()?.id);
        if (setting) {
        }
      }
      return newState;
    }
    case ActionType.DeleteBoard: {
      // document.location.pathname = "/new";
      return state;
    }
    case ActionType.AddColumn: {
      return {
        status: state.status,
        data: {
          ...state.data!,
          columns: [
            ...state.data!.columns,
            {
              name: action.name,
              color: action.color,
              hidden: action.hidden,
            },
          ],
          dirty: true,
        },
      };
    }
    case ActionType.EditColumn: {
      const newColumns = [...state.data!.columns];
      const columnIndex = newColumns.findIndex((column) => column.id === action.columnId);
      const column = newColumns[columnIndex];
      newColumns.splice(columnIndex, 1, {
        ...column,
        name: action.name || column.name,
        color: action.color || column.color,
        hidden: action.hidden === undefined ? column.hidden : action.hidden,
      });
      return {
        status: state.status,
        data: {
          ...state.data!,
          columns: newColumns,
          dirty: true,
        },
      };
    }
    case ActionType.DeleteColumn: {
      const newColumns = [...state.data!.columns];
      const columnIndex = newColumns.findIndex((column) => column.id === action.columnId);
      newColumns.splice(columnIndex, 1);
      return {
        status: state.status,
        data: {
          ...state.data!,
          columns: newColumns,
          dirty: true,
        },
      };
    }
    case ActionType.UpdatedBoard: {
      // User notification
      if (state.data?.voting !== action.board.voting) {
        if (action.board.voting === "active") {
          Toast.success("Voting phase started! You can vote now!");
        } else {
          Toast.error("Voting phase ended! You can't vote anymore!");
        }
      }

      if (!state.data?.dirty) {
        return {
          status: state.status,
          data: action.board,
        };
      }

      const stateColumns = state.data.columns.map((column) => ({name: column.name, hidden: column.hidden})).sort((a, b) => a.name.localeCompare(b.name));
      const actionColumns = action.board.columns.map((column) => ({name: column.name, hidden: column.hidden})).sort((a, b) => a.name.localeCompare(b.name));

      const stateUserConfigurations = state.data.userConfigurations.map((user) => ({user: user.id})).sort((a, b) => a.user.localeCompare(b.user));
      const actionUserConfigurations = action.board.userConfigurations.map((user) => ({user: user.id})).sort((a, b) => a.user.localeCompare(b.user));

      // check if current model from server equals local copy
      if (
        (action.board.name === undefined || state.data.name === action.board.name) &&
        (action.board.joinConfirmationRequired === undefined || state.data.joinConfirmationRequired === action.board.joinConfirmationRequired) &&
        (action.board.encryptedContent === undefined || state.data.encryptedContent === action.board.encryptedContent) &&
        (action.board.showAuthors === undefined || state.data.showAuthors === action.board.showAuthors) &&
        (action.board.timerUTCEndTime === undefined || state.data.timerUTCEndTime === action.board.timerUTCEndTime) &&
        (action.board.expirationUTCTime === undefined || state.data.expirationUTCTime === action.board.expirationUTCTime) &&
        (action.board.voting === undefined || state.data.voting === action.board.voting) &&
        (action.board.showNotesOfOtherUsers === undefined || state.data.showNotesOfOtherUsers === action.board.showNotesOfOtherUsers) &&
        isEqual(stateColumns, actionColumns) &&
        isEqual(stateUserConfigurations, actionUserConfigurations)
      ) {
        return {
          status: state.status,
          data: action.board,
        };
      }
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
    default: {
      return state;
    }
  }
};
