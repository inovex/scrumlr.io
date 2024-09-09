import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState} from "store";
import {Auth} from "../auth";

export const editSelf = createAsyncThunk<Auth, Auth>("participants/editSelf", async (payload) => {
  await API.editUser(payload);
  return payload;
});

export const changePermission = createAsyncThunk<void, {userId: string; moderator: boolean}, {state: ApplicationState}>(
  "participants/changePermission",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.editParticipant(boardId, payload.userId, {
      role: payload.moderator ? "MODERATOR" : "PARTICIPANT",
    });
  }
);

export const setRaisedHandStatus = createAsyncThunk<void, {userId: string; raisedHand: boolean}, {state: ApplicationState}>(
  "participants/setRaisedHandStatus",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.editParticipant(boardId, payload.userId, {
      raisedHand: payload.raisedHand,
    });
  }
);

export const setUserReadyStatus = createAsyncThunk<void, {userId: string; ready: boolean}, {state: ApplicationState}>(
  "participants/setUserReadyStatus",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.editParticipant(boardId, payload.userId, {
      ready: payload.ready,
    });
  }
);

export const setShowHiddenColumns = createAsyncThunk<void, {showHiddenColumns: boolean}, {state: ApplicationState}>(
  "participants/setShowHiddenColumns",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    const self = getState().participants.self?.user.id;
    await API.editParticipant(boardId, self!, {
      showHiddenColumns: payload.showHiddenColumns,
    });
  }
);

export const setUserBanned = createAsyncThunk<void, {userId: string; banned: boolean}, {state: ApplicationState}>("participants/setUserBanned", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.editParticipant(boardId, payload.userId, {
    banned: payload.banned,
  });
});
