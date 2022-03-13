import {Dispatch, MiddlewareAPI} from "redux";
import Socket from "sockette";
import {ApplicationState} from "types";
import store from "store";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";

let socket: Socket | undefined;

export const passRequestMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.JoinBoard) {
    API.joinBoard(action.boardId, action.passphrase)
      .then((r) => {
        if (r.status === "ACCEPTED") {
          store.dispatch(Actions.permittedBoardAccess(action.boardId));
        } else if (r.status === "REJECTED") {
          store.dispatch(Actions.rejectedBoardAccess());
        } else if (r.status === "WRONG_PASSPHRASE") {
          store.dispatch(Actions.requirePassphraseChallenge());
        } else if (r.status === "PENDING") {
          store.dispatch(Actions.pendingBoardAccessConfirmation(action.boardId, r.joinRequestReference!));
        }
      })
      .catch(() => {
        // FIXME show error
      });
  }

  if (action.type === Action.SetRoute) {
    if (socket) {
      socket.close();
      socket = undefined;
    }
  }

  if (action.type === Action.PendingBoardAccessConfirmation) {
    // change protocol of url
    const websocketURL = new URL(action.requestReference);
    websocketURL.protocol = "ws";

    socket = new Socket(websocketURL.toString(), {
      timeout: 5000,
      maxAttempts: 0,
      onopen: (e: Event) => console.log("connected", e),
      onerror: (e: Event) => console.log("error", e),
      onclose: (e: CloseEvent) => console.log("closed", e),
      onreconnect: () => console.log("reconnect"),

      onmessage: async (evt: MessageEvent<string>) => {
        const message = JSON.parse(evt.data);
        if (message === "SESSION_ACCEPTED") {
          store.dispatch(Actions.permittedBoardAccess(action.board));
        } else if (message === "SESSION_REJECTED") {
          store.dispatch(Actions.rejectedBoardAccess());
        }
      },
    });
  }

  if (action.type === Action.AcceptJoinRequests) {
    action.userIds.forEach((userId) => {
      API.acceptJoinRequest(action.context.board!, userId).catch(() => {
        // FIXME error handling
      });
    });
  }

  if (action.type === Action.RejectJoinRequests) {
    action.userIds.forEach((userId) => {
      API.rejectJoinRequest(action.context.board!, userId).catch(() => {
        // FIXME error handling
      });
    });
  }
};
