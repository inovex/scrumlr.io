import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Actions, Action, ReduxAction} from "store/action";
import Socket from "sockette";
import {ServerEvent} from "../../types/websocket";

let socket: Socket | undefined;

export const passBoardMiddleware = async (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
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
      onmessage: async (evt: MessageEvent<ServerEvent>) => {
        if (evt.data.type === "INIT") {
          const {board, columns, participants} = evt.data.data;
          dispatch(Actions.initializeBoard(board, columns, participants));
        }

        if (evt.data.type === "COLUMNS_UPDATED") {
          const columns = evt.data.data;
          dispatch(Actions.updateColumns(columns));
        }
      },
      onclose: (e: CloseEvent) => console.log("closed", e),
    });
  }
};
