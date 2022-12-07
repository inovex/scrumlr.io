import {Dispatch, MiddlewareAPI} from "redux";
import Socket from "sockette";
import {Action, ReduxAction} from "store/action";
import {ApplicationState} from "types";
import {SERVER_WEBSOCKET_URL} from "../../config";

let moderationSocket: Socket | undefined;

export const passModerationMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.JoinModeration) {
    moderationSocket = new Socket(`${SERVER_WEBSOCKET_URL}/boards/${action.boardId}/moderation`, {
      timeout: 5000,
      maxAttempts: 0,
      onmessage: (messageEvent: MessageEvent<string>) => {
        console.log(messageEvent);
      },
    });
  }

  if (action.type === Action.LeaveBoard) {
    moderationSocket?.close();
  }
};
