import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Actions, Action, ReduxAction} from "store/action";
import Socket from "sockette";
import {ServerEvent} from "types/websocket";
import store from "store";
import {API} from "api";
import {Timer} from "utils/timer";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import {Button} from "../../components/Button";
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
          const {board, columns, participants, notes, votes, votings, requests} = message.data;
          store.dispatch(Actions.initializeBoard(board, participants, requests || [], columns, notes || [], votes || [], votings || []));
        }

        if (message.type === "BOARD_UPDATED") {
          store.dispatch(Actions.updatedBoard(message.data));
        }

        if (message.type === "BOARD_TIMER_UPDATED") {
          store.dispatch(Actions.updatedBoardTimer(message.data));
        }

        if (message.type === "BOARD_DELETED") {
          store.dispatch(Actions.leaveBoard());
        }

        if (message.type === "COLUMNS_UPDATED") {
          const columns = message.data;
          store.dispatch(Actions.updateColumns(columns));
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
          const noteId = message.data;
          store.dispatch(Actions.deletedNote(noteId));
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
      name: action.board.name == null ? currentState.name : action.board.name,
    }).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.editBoard")}</div>
          <Button onClick={() => store.dispatch(Actions.editBoard(action.board))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
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
      Toast.error(
        <div>
          <div>{i18n.t("Error.shareNote")}</div>
          <Button onClick={() => store.dispatch(Actions.shareNote(action.note))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
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
      Toast.error(
        <div>
          <div>{i18n.t("Error.unshareNote")}</div>
          <Button onClick={() => store.dispatch(Actions.stopSharing())}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }

  if (action.type === Action.DeleteBoard) {
    API.deleteBoard(action.context.board!)
      .then(() => {
        document.location.pathname = "/";
      })
      .catch(() => {
        Toast.error(
          <div>
            <div>{i18n.t("Error.deleteBoard")}</div>
            <Button onClick={() => store.dispatch(Actions.deleteBoard())}>{i18n.t("Error.retry")}</Button>
          </div>
        );
      });
  }
};
