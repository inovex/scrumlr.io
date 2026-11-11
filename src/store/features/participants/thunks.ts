import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState, retryable} from "store";
import {Toast} from "utils/Toast";
import i18n from "i18next";
import {Auth, editUserOptimistically} from "store/features";

export const editSelf = createAsyncThunk<
  Auth,
  {
    auth: Auth;
    applyOptimistically?: boolean;
  },
  {state: ApplicationState}
>("participants/editSelf", async (payload, {dispatch}) => {
  if (payload.applyOptimistically) {
    // instantly apply changes (required when not in a board, since no event is retrieved)
    dispatch(editUserOptimistically(payload.auth));
  }

  await API.editUser(payload.auth);
  return payload.auth;
});

export const changePermission = createAsyncThunk<void, {userId: string; moderator: boolean}, {state: ApplicationState}>(
  "participants/changePermission",
  async (payload, {dispatch, getState}) => {
    const boardId = getState().board.data!.id;
    await retryable(
      () =>
        API.editParticipant(boardId, payload.userId, {
          role: payload.moderator ? "MODERATOR" : "PARTICIPANT",
        }),
      dispatch,
      () => changePermission({...payload}),
      "changePermission"
    );
  }
);

export const setRaisedHandStatus = createAsyncThunk<void, {userId: string; raisedHand: boolean}, {state: ApplicationState}>(
  "participants/setRaisedHandStatus",
  async (payload, {dispatch, getState}) => {
    const boardId = getState().board.data!.id;
    await retryable(
      () =>
        API.editParticipant(boardId, payload.userId, {
          raisedHand: payload.raisedHand,
        }),
      dispatch,
      () => setRaisedHandStatus({...payload}),
      "setRaiseHand"
    );
  }
);

export const setUserReadyStatus = createAsyncThunk<void, {userId: string; ready: boolean}, {state: ApplicationState}>(
  "participants/setUserReadyStatus",
  async (payload, {dispatch, getState}) => {
    const boardId = getState().board.data!.id;
    await retryable(
      () =>
        API.editParticipant(boardId, payload.userId, {
          ready: payload.ready,
        }),
      dispatch,
      () => setUserReadyStatus({...payload}),
      "setUserReady"
    );
  }
);

export const setShowHiddenColumns = createAsyncThunk<void, {showHiddenColumns: boolean}, {state: ApplicationState}>(
  "participants/setShowHiddenColumns",
  async (payload, {dispatch, getState}) => {
    const boardId = getState().board.data!.id;
    const self = getState().participants.self?.user.id;
    await retryable(
      () =>
        API.editParticipant(boardId, self!, {
          showHiddenColumns: payload.showHiddenColumns,
        }),
      dispatch,
      () => setShowHiddenColumns({...payload}),
      "setShowHiddenColumns"
    );
  }
);

export const setUserBanned = createAsyncThunk<void, {userId: string; banned: boolean}, {state: ApplicationState}>(
  "participants/setUserBanned",
  async (payload, {dispatch, getState}) => {
    const boardId = getState().board.data!.id;

    await retryable(
      () =>
        API.editParticipant(boardId, payload.userId, {
          banned: payload.banned,
        }),
      dispatch,
      () => setUserBanned({...payload}),
      "setUserBanned"
    )
  }
);
