import {createReducer} from "@reduxjs/toolkit";
import {AuthState} from "./types";
import {editUserOptimistically, signIn, userCheckCompleted} from "./actions";
import {signOut} from "./thunks";

const initialState: AuthState = {user: undefined, initializationSucceeded: null};

export const authReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(signIn, (state, action) => {
      // inside reducers mutations like this are allowed, since Immer is used internally.
      // note that directly reassigning the whole state won't work though!
      state.user = action.payload;
    })
    .addCase(signOut.fulfilled, (state) => {
      state.user = undefined;
    })
    .addCase(userCheckCompleted, (state, action) => {
      state.initializationSucceeded = action.payload;
    })
    .addCase(editUserOptimistically, (state, action) => {
      state.user = action.payload;
    })
);
