import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Actions, Action, ReduxAction} from "store/action";
import Socket from "sockette";
import {ServerEvent} from "../../types/websocket";
import store from "../index";
import {API} from "../../api";

let socket: Socket | undefined;

export const passBoardMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.LeaveBoard) {
    socket?.close();
  }

  if (action.type === Action.PermittedBoardAccess) {
    // FIXME implement all event subscriptions
    socket = new Socket(`ws://localhost:8080/boards/${action.boardId}`, {
      timeout: 5000,
      maxAttempts: 0,
      onopen: (e: Event) => console.log("connected", e),
      onerror: (e: Event) => console.log("error", e),
      onclose: (e: CloseEvent) => console.log("closed", e),
      onreconnect: () => console.log("reconnect"),

      onmessage: async (evt: MessageEvent<string>) => {
        const message: ServerEvent = JSON.parse(evt.data);

        if (message.type === "INIT") {
          const {board, columns, participants, notes, votes, votings, requests} = message.data;
          store.dispatch(Actions.initializeBoard(board, participants, requests || [], columns, notes || [], votes || [], votings || []));
        }

        if (message.type === "BOARD_UPDATED") {
          store.dispatch(Actions.updatedBoard(message.data));
        }

        if (message.type === "BOARD_DELETED") {
          // FIXME board deleted event
          store.dispatch(Actions.leaveBoard());
        }

        if (message.type === "COLUMNS_UPDATED") {
          const columns = message.data;
          store.dispatch(Actions.updateColumns(columns));
        }

        if (message.type === "NOTES_UPDATED") {
          const notes = message.data;
          store.dispatch(Actions.updatedNotes(notes));
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
      timerEnd: currentState.timerEnd,
      accessPolicy: action.board.accessPolicy,
      passphrase: action.board.passphrase,
      allowStacking: action.board.allowStacking,
      showAuthors: action.board.showAuthors,
      showNotesOfOtherUsers: action.board.showNotesOfOtherUsers,
      name: action.board.name === undefined ? currentState.name : action.board.name,
    }).catch(() => {
      // TODO report error
    });
  }

  if (action.type === Action.SetTimer) {
    const currentState = stateAPI.getState().board.data!;
    API.editBoard(action.context.board!, {
      sharedNote: currentState.sharedNote,
      showVoting: currentState.showVoting,
      // FIXME move this to reducer instead of API call
      timerEnd: new Date(action.endDate.getTime() - action.context.serverTimeOffset).toISOString(),
    }).catch(() => {
      // TODO report error
    });
  }

  if (action.type === Action.CancelTimer) {
    const currentState = stateAPI.getState().board.data!;
    API.editBoard(action.context.board!, {
      sharedNote: currentState.sharedNote,
      showVoting: currentState.showVoting,
      timerEnd: undefined,
    }).catch(() => {
      // TODO report error
    });
  }

  if (action.type === Action.ShareNote) {
    const currentState = stateAPI.getState().board.data!;
    API.editBoard(action.context.board!, {
      sharedNote: action.note,
      showVoting: currentState.showVoting,
      timerEnd: currentState.timerEnd,
    }).catch(() => {
      // TODO report error
    });
  }

  if (action.type === Action.StopSharing) {
    const currentState = stateAPI.getState().board.data!;
    API.editBoard(action.context.board!, {
      sharedNote: undefined,
      showVoting: currentState.showVoting,
      timerEnd: currentState.timerEnd,
    }).catch(() => {
      // TODO report error
    });
  }
};
