import {createAsyncThunk} from "@reduxjs/toolkit";
import {signIn, userCheckCompleted} from "store/features/auth/actions";
import {ACCOUNT_TYPE_ANONYMOUS} from "store/features/auth/types";
import {API} from "api";
import {setServerInfo} from "store/features";
import {retryable} from "store";

export const initAuth = createAsyncThunk("auth/initAuth", async (_payload, {dispatch}) => {
  dispatch(setServerInfo());
  retryable(() => API.getCurrentUser(), dispatch, initAuth, "serverConnection")
    .then((user) => {
      if (user) {
        const isAnonymous = user.accountType === ACCOUNT_TYPE_ANONYMOUS;
        dispatch(signIn({id: user.id, name: user.name, isAnonymous, avatar: user.avatar}));
      }
      dispatch(userCheckCompleted(true));
    })
    .catch(() => {
      dispatch(userCheckCompleted(false));
    });
});

export const signOut = createAsyncThunk("auth/signOut", async (_payload, {dispatch}) => {
  await retryable(() => API.signOut(), dispatch, signOut, "logout");
  window.location.replace("/login");
});

export const deleteAccount = createAsyncThunk<void, string>("auth/deleteAccount", async (userId, {dispatch}) => {
  await retryable(
    () => API.deleteUser(userId),
    dispatch,
    () => deleteAccount(userId),
    "deleteAccount"
  );
  // After successful deletion, redirect to login with query parameter
  window.location.replace("/login?accountDeleted=true");
});
