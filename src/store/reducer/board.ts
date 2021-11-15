/* eslint-disable @typescript-eslint/no-non-null-assertion */
import isEqual from "lodash/isEqual";
import {BoardState} from "types/store";
import {ActionType, ReduxAction} from "store/action";
import {Toast} from "utils/Toast";
import i18n from "i18next";

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
        Toast.success(i18n.t(action.board.voting === "active" ? "Toast.votingStarted" : "Toast.votingFinished"));
      }
      // Moderator started moderation phase - notification to moderator (user who started the moderation phase)
      if (action.board.moderation) {
        Toast.success(i18n.t(action.board.moderation.status === "active" ? "Toast.focusModeStart" : "Toast.focusModeFinished"));
      }

      return {
        status: state.status,
        data: {
          ...state.data!,
          ...action.board,
          accessPolicy: (action.board.accessPolicy?.type || state.data?.accessPolicy)!,
          dirty: true,
        },
      };
    }
    case ActionType.DeleteBoard: {
      document.location.pathname = "/";
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
              name: action.column.name,
              color: action.column.color,
              hidden: action.column.hidden,
            },
          ],
          dirty: true,
        },
      };
    }
    case ActionType.EditColumn: {
      const newColumns = [...state.data!.columns];
      const columnIndex = newColumns.findIndex((column) => column.columnId === action.column.columnId);
      const column = newColumns[columnIndex];
      newColumns.splice(columnIndex, 1, {
        ...column,
        name: action.column.name || column.name,
        color: action.column.color || column.color,
        hidden: action.column.hidden === undefined ? column.hidden : action.column.hidden,
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
      const columnIndex = newColumns.findIndex((column) => column.columnId === action.columnId);
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
      // Voting notification
      if (state.data?.voting !== action.board.voting) {
        if (action.board.voting === "active") {
          Toast.success(i18n.t("Toast.votingPhaseStarted"));
        } else {
          Toast.error(i18n.t("Toast.votingPhaseEnded"));
        }
      }

      // Moderation notification
      if (state.data?.moderation.status !== action.board.moderation.status) {
        if (action.board.moderation.status === "active") {
          Toast.success(i18n.t("Toast.moderationStarted"));
        } else {
          Toast.error(i18n.t("Toast.moderationEnded"));
        }
      }

      // Timer notification
      if (state.data?.timerUTCEndTime?.getTime() !== action.board.timerUTCEndTime?.getTime()) {
        if (action.board.timerUTCEndTime) {
          Toast.success(i18n.t("Toast.timerStarted"));
        } else if (state.data!.timerUTCEndTime!.getTime() <= new Date().getTime()) {
          Toast.error(i18n.t("Toast.timerEnded"));
        } else {
          Toast.error(i18n.t("Toast.timerCancelled"));
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
        (action.board.accessPolicy === undefined || state.data.accessPolicy === action.board.accessPolicy) &&
        (action.board.encryptedContent === undefined || state.data.encryptedContent === action.board.encryptedContent) &&
        (action.board.showAuthors === undefined || state.data.showAuthors === action.board.showAuthors) &&
        (action.board.timerUTCEndTime === undefined || state.data.timerUTCEndTime === action.board.timerUTCEndTime) &&
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
