import {createAction} from "@reduxjs/toolkit";
import {BoardActionType, BoardWithServerTimeOffset} from "./types";
import {Auth} from "../auth";

export const initializeBoard = createAction<{fullBoard: BoardActionType; serverTimeOffset: number; self: Auth}>("scrumlr.io/initializeBoard");

export const updatedBoard = createAction<BoardWithServerTimeOffset>("scrumlr.io/updatedBoard");
export const updatedBoardTimer = createAction<BoardWithServerTimeOffset>("scrumlr.io/updatedBoardTimer");

export const rejectedBoardAccess = createAction("scrumlr.io/rejectedBoardAccess");
export const passphraseChallengeRequired = createAction("scrumlr.io/passphraseChallengeRequired");
export const incorrectPassphrase = createAction("scrumlr.io/incorrectPassphrase");
export const tooManyJoinRequests = createAction("scrumlr.io/tooManyJoinRequests");
export const bannedFromBoard = createAction("scrumlr.io/bannedFromBoard");
