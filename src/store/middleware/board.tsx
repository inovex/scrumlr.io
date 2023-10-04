import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Actions, Action, ReduxAction} from "store/action";
import Socket from "sockette";
import {ServerEvent} from "types/websocket";
import store from "store";
import {API} from "api";
import {Timer} from "utils/timer";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import {SERVER_WEBSOCKET_URL} from "../../config";

let socket: Socket | undefined;

export const passBoardMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.LeaveBoard) {
    socket?.close();
  }

  if (action.type === Action.PermittedBoardAccess) {
    socket = new Socket(`${SERVER_WEBSOCKET_URL}/boards/${action.boardId}`, {
      timeout: 5000,
      maxAttempts: 0,
      onmessage: async (evt: MessageEvent<string>) => {
        const message: ServerEvent = JSON.parse(evt.data);

        if (message.type === "INIT") {
          const {board, columns, participants, notes, reactions, votes, votings, requests, assignments} = message.data;
          store.dispatch(Actions.initializeBoard(board, participants, requests || [], columns, notes || [], reactions || [], votes || [], votings || [], assignments || []));
        }

        if (message.type === "BOARD_UPDATED") {
          store.dispatch(Actions.updatedBoard(message.data));
        }

        if (message.type === "BOARD_TIMER_UPDATED") {
          store.dispatch(Actions.updatedBoardTimer(message.data));
        }

        if (message.type === "BOARD_DELETED") {
          store.dispatch(Actions.leaveBoard());
          window.location.assign("/?boardDeleted=true");
        }

        if (message.type === "COLUMN_CREATED") {
          store.dispatch(Actions.createdColumn(message.data.column, message.data.columnsOrder));
        }

        if (message.type === "COLUMN_UPDATED") {
          store.dispatch(Actions.updatedColumn(message.data.column, message.data.columnsOrder));
        }

        if (message.type === "COLUMN_CREATED") {
          store.dispatch(Actions.createdColumn(message.data.column, message.data.columns_order));
        }

        if (message.type === "COLUMN_UPDATED") {
          store.dispatch(Actions.updatedColumn(message.data.column, message.data.columns_order));
        }

        if (message.type === "COLUMN_DELETED") {
          const columnId = message.data;
          store.dispatch(Actions.deletedColumn(columnId));
        }

        if (message.type === "NOTES_UPDATED") {
          const notes = message.data;
          store.dispatch(Actions.updatedNotes(notes));
        }
        if (message.type === "NOTE_DELETED") {
          const noteId = message.data.note;
          const {deleteStack} = message.data;
          store.dispatch(Actions.deletedNote(noteId, deleteStack));
        }
        if (message.type === "REACTION_ADDED") {
          const reaction = message.data;
          store.dispatch(Actions.addedReaction(reaction));
        }
        if (message.type === "REACTION_DELETED") {
          const reactionId = message.data;
          store.dispatch(Actions.deletedReaction(reactionId));
        }
        if (message.type === "REACTION_UPDATED") {
          const reaction = message.data;
          store.dispatch(Actions.updatedReaction(reaction));
        }
        if (message.type === "NOTES_SYNC") {
          const notes = message.data;
          store.dispatch(Actions.syncNotes(notes));
        }
        if (message.type === "PARTICIPANT_CREATED") {
          store.dispatch(Actions.createdParticipant(message.data));
        }
        if (message.type === "PARTICIPANT_UPDATED") {
          store.dispatch(Actions.updatedParticipant(message.data));
        }
        if (message.type === "PARTICIPANTS_UPDATED") {
          store.dispatch(Actions.setParticipants(message.data));
        }

        if (message.type === "VOTING_CREATED") {
          store.dispatch(Actions.createdVoting(message.data));
        }
        if (message.type === "VOTING_UPDATED") {
          store.dispatch(Actions.updatedVoting(message.data.voting, message.data.notes));
        }

        if (message.type === "VOTES_UPDATED") {
          const votes = message.data;
          store.dispatch(Actions.updatedVotes(votes));
        }

        if (message.type === "REQUEST_CREATED") {
          store.dispatch(Actions.createJoinRequest(message.data));
        }
        if (message.type === "REQUEST_UPDATED") {
          store.dispatch(Actions.updateJoinRequest(message.data));
        }

        if (message.type === "ASSIGNMENT_CREATED") {
          store.dispatch(Actions.createdAssignment(message.data));
        }

        if (message.type === "ASSIGNMENT_DELETED") {
          store.dispatch(Actions.deletedAssignment(message.data));
        }
        if (message.type === "BOARD_REACTION_ADDED") {
          store.dispatch(Actions.addedBoardReaction(message.data));
          setTimeout(() => store.dispatch(Actions.removeBoardReaction(message.data.id)), 5000);
        }
      },
    });
  }

  if (action.type === Action.EditBoard) {
    const currentState = stateAPI.getState().board.data!;
    API.editBoard(action.context.board!, {
      sharedNote: currentState.sharedNote,
      showVoting: currentState.showVoting,
      timerStart: Timer.removeOffsetFromDate(currentState.timerStart, stateAPI.getState().view.serverTimeOffset),
      timerEnd: Timer.removeOffsetFromDate(currentState.timerEnd, stateAPI.getState().view.serverTimeOffset),
      accessPolicy: action.board.accessPolicy,
      passphrase: action.board.passphrase,
      allowStacking: action.board.allowStacking,
      showAuthors: action.board.showAuthors,
      showNotesOfOtherUsers: action.board.showNotesOfOtherUsers,
      showNoteReactions: action.board.showNoteReactions,
      name: action.board.name == null ? currentState.name : action.board.name,
    }).catch(() => {
      i18n.on("loaded", () => {
        Toast.error({
          title: i18n.t("Error.editBoard"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.editBoard(action.board)),
        });
      });
    });
  }

  if (action.type === Action.SetTimer) {
    const currentState = stateAPI.getState().board.data!;
    API.setTimer(currentState.id, action.minutes);
  }

  if (action.type === Action.CancelTimer) {
    const currentState = stateAPI.getState().board.data!;
    API.deleteTimer(currentState.id);
  }

  if (action.type === Action.ShareNote) {
    const currentState = stateAPI.getState().board.data!;
    const note = stateAPI.getState().notes.find((n) => n.id === action.note);
    const column = stateAPI.getState().columns.find((c) => c.id === note?.position.column);
    if (!column?.visible) return; // Do not share notes in hidden columns
    API.editBoard(action.context.board!, {
      sharedNote: action.note,
      showVoting: currentState.showVoting,
      timerStart: Timer.removeOffsetFromDate(currentState.timerStart, stateAPI.getState().view.serverTimeOffset),
      timerEnd: Timer.removeOffsetFromDate(currentState.timerEnd, stateAPI.getState().view.serverTimeOffset),
    }).catch(() => {
      i18n.on("loaded", () => {
        Toast.error({
          title: i18n.t("Error.shareNote"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.shareNote(action.note)),
        });
      });
    });
  }

  if (action.type === Action.StopSharing) {
    const currentState = stateAPI.getState().board.data!;
    API.editBoard(action.context.board!, {
      sharedNote: undefined,
      showVoting: currentState.showVoting,
      timerStart: Timer.removeOffsetFromDate(currentState.timerStart, stateAPI.getState().view.serverTimeOffset),
      timerEnd: Timer.removeOffsetFromDate(currentState.timerEnd, stateAPI.getState().view.serverTimeOffset),
    }).catch(() => {
      i18n.on("loaded", () => {
        Toast.error({
          title: i18n.t("Error.unshareNote"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.stopSharing()),
        });
      });
    });
  }

  if (action.type === Action.DeleteBoard) {
    API.deleteBoard(action.context.board!)
      .then(() => {
        document.location.pathname = "/";
      })
      .catch(() => {
        i18n.on("loaded", () => {
          Toast.error({
            title: i18n.t("Error.deleteBoard"),
            buttons: [i18n.t("Error.retry")],
            firstButtonOnClick: () => store.dispatch(Actions.deleteBoard()),
          });
        });
      });
  }
};
