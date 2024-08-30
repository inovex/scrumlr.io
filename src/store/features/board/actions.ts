import {createAction} from "@reduxjs/toolkit";
import {Board, BoardActionType, EditBoardRequest} from "./types";

// TODO possibly adjust payload types
export const leaveBoard = createAction("scrumlr.io/leaveBoard");
export const joinBoard = createAction("scrumlr.io/joinBoard");
export const initializeBoard = createAction<BoardActionType>("scrumlr.io/initializeBoard");
export const editBoard = createAction<EditBoardRequest>("scrumlr.io/editBoard");
export const updatedBoard = createAction<BoardActionType>("scrumlr.io/updatedBoard");
export const updatedBoardTimer = createAction<Board>("scrumlr.io/updatedBoardTimer");
export const deleteBoard = createAction("scrumlr.io/deleteBoard");
export const permittedBoardAccess = createAction<string>("scrumlr.io/permittedBoardAccess");
export const rejectedBoardAccess = createAction("scrumlr.io/rejectedBoardAccess");
export const pendingBoardAccessConfirmation = createAction<{board: string; requestReference: string}>("scrumlr.io/pendingBoardAccessConfirmation");
export const passphraseChallengeRequired = createAction("scrumlr.io/passphraseChallengeRequired");
export const incorrectPassphrase = createAction("scrumlr.io/incorrectPassphrase");
export const tooManyJoinRequests = createAction("scrumlr.io/tooManyJoinRequests");
export const bannedFromBoard = createAction("scrumlr.io/bannedFromBoard");
export const setTimer = createAction<number>("scrumlr.io/setTimer");
export const cancelTimer = createAction("scrumlr.io/cancelTimer");
export const incrementTimer = createAction("scrumlr.io/incrementTimer");