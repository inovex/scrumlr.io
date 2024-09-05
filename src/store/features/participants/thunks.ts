import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState} from "store";
import {Auth} from "../auth";

export const editSelf = createAsyncThunk<Auth, Auth>("scrumlr.io/editSelf", async (payload) => {
  await API.editUser(payload);
  return payload;
});

export const changePermission = createAsyncThunk<void, {userId: string; moderator: boolean}, {state: ApplicationState}>(
  "scrumlr.io/changePermission",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.editParticipant(boardId, payload.userId, {
      role: payload.moderator ? "MODERATOR" : "PARTICIPANT",
    });
  }
);

export const setRaisedHandStatus = createAsyncThunk<void, {userId: string; raisedHand: boolean}, {state: ApplicationState}>(
  "scrumlr.io/setRaisedHandStatus",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.editParticipant(boardId, payload.userId, {
      raisedHand: payload.raisedHand,
    });
  }
);

export const setShowHiddenColumns = createAsyncThunk<void, {userId: string; showHiddenColumns: boolean}, {state: ApplicationState}>(
  "scrumlr.io/setShowHiddenColumns",
  async (payload, {getState}) => {
    const boardId = getState().board.data!.id;
    await API.editParticipant(boardId, payload.userId, {
      showHiddenColumns: payload.showHiddenColumns,
    });
  }
);

export const setUserBanned = createAsyncThunk<void, {userId: string; banned: boolean}, {state: ApplicationState}>("scrumlr.io/setUserBanned", async (payload, {getState}) => {
  const boardId = getState().board.data!.id;
  await API.editParticipant(boardId, payload.userId, {
    banned: payload.banned,
  });
});
