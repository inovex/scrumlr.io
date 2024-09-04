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
    if (r.status === "ACCEPTED") {
      dispatch(permittedBoardAccess(payload.boardId));
    } else if (r.status === "REJECTED") {
      dispatch(rejectedBoardAccess());
    } else if (r.status === "PASSPHRASE_REQUIRED") {
      dispatch(passphraseChallengeRequired());
    } else if (r.status === "WRONG_PASSPHRASE") {
      dispatch(incorrectPassphrase());
    } else if (r.status === "PENDING") {
      dispatch(pendingBoardAccessConfirmation({board: payload.boardId, requestReference: r.joinRequestReference!}));
    } else if (r.status === "TOO_MANY_JOIN_REQUESTS") {
      dispatch(tooManyJoinRequests());
    } else if (r.status === "BANNED") {
      dispatch(bannedFromBoard());
    }
  });
});
