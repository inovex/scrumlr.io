import {createAction} from "@reduxjs/toolkit";
import {BoardWithServerTimeOffset} from "./types";

export const updatedBoard = createAction<BoardWithServerTimeOffset>("board/updatedBoard");
export const updatedBoardTimer = createAction<BoardWithServerTimeOffset>("board/updatedBoardTimer");

export const rejectedBoardAccess = createAction("board/rejectedBoardAccess");
export const passphraseChallengeRequired = createAction("board/passphraseChallengeRequired");
export const incorrectPassphrase = createAction("board/incorrectPassphrase");
export const tooManyJoinRequests = createAction("board/tooManyJoinRequests");
export const bannedFromBoard = createAction("board/bannedFromBoard");
