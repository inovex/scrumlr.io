import Socket from "sockette";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "../../../api";
import {permittedBoardAccess} from "../board/thunks";
import {bannedFromBoard, incorrectPassphrase, passphraseChallengeRequired, pendingBoardAccessConfirmation, rejectedBoardAccess, tooManyJoinRequests} from "../board";
import {ApplicationState} from "../../../types";

const socket: Socket | null = null;

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
