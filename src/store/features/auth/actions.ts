import {createAction} from "@reduxjs/toolkit";
import {Auth} from "./types";

export const signIn = createAction<Auth>("scrumlr.io/signIn");

export const userCheckCompleted = createAction<boolean>("scrumlr.io/userCheckCompleted");
