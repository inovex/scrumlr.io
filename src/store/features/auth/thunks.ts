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

// use createAsyncThunk, because the action also changes state in the reducer.
export const signOut = createAsyncThunk("auth/signOut", async (_payload, {dispatch}) => {
  retryable(() => API.signOut(), dispatch, signOut, "logout")
    // eslint-disable-next-line no-restricted-globals
    .then(() => location.reload());
});
