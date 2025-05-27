import {createAction} from "@reduxjs/toolkit";
import {BoardActionType, BoardWithServerTimeOffset} from "./types";
import {Auth} from "../auth";

export const initializeBoard = createAction<{fullBoard: BoardActionType; serverTimeOffset: number; self: Auth}>("board/initializeBoard");

export const updatedBoard = createAction<BoardWithServerTimeOffset>("board/updatedBoard");
export const updatedBoardTimer = createAction<BoardWithServerTimeOffset>("board/updatedBoardTimer");

export const rejectedBoardAccess = createAction("board/rejectedBoardAccess");
export const passphraseChallengeRequired = createAction("board/passphraseChallengeRequired");
export const incorrectPassphrase = createAction("board/incorrectPassphrase");
export const tooManyJoinRequests = createAction("board/tooManyJoinRequests");
export const bannedFromBoard = createAction("board/bannedFromBoard");
