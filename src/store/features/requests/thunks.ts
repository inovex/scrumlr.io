import Socket from "sockette";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "../../../api";
import {permittedBoardAccess} from "../board/thunks";
import {bannedFromBoard, incorrectPassphrase, passphraseChallengeRequired, rejectedBoardAccess, tooManyJoinRequests} from "../board";
import {SERVER_WEBSOCKET_PROTOCOL} from "../../../config";

let socket: Socket | null = null;

export const pendingBoardAccessConfirmation = createAsyncThunk<void, {board: string; requestReference: string}, {state: ApplicationState}>(
  "scrumlr.io/pendingBardAccessConfirmation",
  async (payload, {dispatch}) => {
    // change protocol of url
    const websocketURL = new URL(payload.requestReference);
    websocketURL.protocol = SERVER_WEBSOCKET_PROTOCOL;

    socket = new Socket(websocketURL.toString(), {
      timeout: 5000,
      maxAttempts: 0,
      onmessage: async (evt: MessageEvent<string>) => {
        const message = JSON.parse(evt.data);
        if (message === "SESSION_ACCEPTED") {
          dispatch(permittedBoardAccess(payload.board));
        } else if (message === "SESSION_REJECTED") {
          dispatch(rejectedBoardAccess());
        }
      },
    });
  }
);

// was defined in board actions before
export const joinBoard = createAsyncThunk<void, {boardId: string; passphrase?: string}, {state: ApplicationState}>("scrumlr.io/joinBoard", async (payload, {dispatch}) => {
  API.joinBoard(payload.boardId, payload.passphrase).then((r) => {
    switch (r.status) {
      case "ACCEPTED":
        dispatch(permittedBoardAccess(payload.boardId));
        break;
      case "REJECTED":
        dispatch(rejectedBoardAccess());
        break;
      case "PASSPHRASE_REQUIRED":
        dispatch(passphraseChallengeRequired());
        break;
      case "WRONG_PASSPHRASE":
        dispatch(incorrectPassphrase());
        break;
      case "PENDING":
        dispatch(pendingBoardAccessConfirmation({board: payload.boardId, requestReference: r.joinRequestReference!}));
        break;
      case "TOO_MANY_JOIN_REQUESTS":
        dispatch(tooManyJoinRequests());
        break;
      case "BANNED":
        dispatch(bannedFromBoard());
        break;
      default:
        break;
    }
  });
});

// don't know why this is needed tbh, but I'm just gonna keep it
export const setRoute = createAsyncThunk<string, string>("scrumlr.io/setRoute", async (payload) => {
  if (socket) {
    socket.close();
    socket = null;
  }
  return payload;
});

export const acceptJoinRequests = createAsyncThunk<void, string[], {state: ApplicationState}>("scrumlr.io/acceptJoinRequests", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;

  await Promise.all(payload.map((userId) => API.acceptJoinRequest(boardId, userId)));
});

export const rejectJoinRequests = createAsyncThunk<void, string[], {state: ApplicationState}>("scrumlr.io/rejectJoinRequests", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;

  await Promise.all(payload.map((userId) => API.rejectJoinRequest(boardId, userId)));
});