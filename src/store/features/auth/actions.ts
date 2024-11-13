import {createAction} from "@reduxjs/toolkit";
import {Auth} from "./types";

export const signIn = createAction<Auth>("auth/signIn");

export const userCheckCompleted = createAction<boolean>("auth/userCheckCompleted");

// allow changes to user auth without being part of a board
export const editUserOptimistically = createAction<Auth>("auth/editUserOptimistically");
