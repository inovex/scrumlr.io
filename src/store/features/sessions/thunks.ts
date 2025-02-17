import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState, retryable} from "store";
import {API} from "api";
import Socket from "sockette";
import {Session} from "./types";
import {bannedFromBoard, incorrectPassphrase, passphraseChallengeRequired, permittedBoardAccess, rejectedBoardAccess, tooManyJoinRequests} from "../board";
import {pendingBoardAccessConfirmation} from "../requests";

let socket: Socket | null = null;

export const getSessions = createAsyncThunk<Session[], void, {state: ApplicationState}>("sessions/getSessions", async () => {
  const sessions = await API.getSessions();
  return sessions;
});

// TODO: i dont think works, i dont think there's sth behind that url. it should delete a board then right?
export const deleteSession = createAsyncThunk<string, {id: string}, {state: ApplicationState}>("sessions/deleteSession", async (payload) => {
  await API.deleteSession(payload.id);
  return payload.id; // return former id to remove entries from store
});

// TODO: hier muessen auch die ganzen anderen notes usw reingeladen werden, die vorherigen participants maybe?
export const createBoardFromSession = createAsyncThunk<string, Session>(
  "board/createBoardFromSession",
  async (payload) =>
    // API.createBoard(payload.name, {type: payload.accessPolicy}, payload.columns)
    API.openBoard(payload.id) // TODO: in openBoard muss ich mal sehen, wie ich ein get zu einem bestehenden board machen kann
  // API.joinBoard(payload.id);
);

export const joinSession = createAsyncThunk<void, {boardId: string; passphrase?: string}, {state: ApplicationState}>("requests/joinBoard", async (payload, {dispatch}) => {
  await retryable(
    () => API.joinBoard(payload.boardId, payload.passphrase),
    dispatch,
    () => joinSession({...payload}),
    "joinBoard"
  ).then((r) => {
    switch (r.status) {
      case "ACCEPTED":
        dispatch(permittedBoardAccess(payload.boardId));
        if (socket) {
          socket.close();
          socket = null;
        }
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
