import {createAction} from "@reduxjs/toolkit";
import {Auth} from "./types";

export const signIn = createAction<Auth>("auth/signIn");

export const userCheckCompleted = createAction<boolean>("auth/userCheckCompleted");
