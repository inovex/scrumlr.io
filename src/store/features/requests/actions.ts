import {createAction} from "@reduxjs/toolkit";
import {Request} from "./types";

export const createJoinRequest = createAction<Request>("scrumlr.io/createJoinRequest");

export const updateJoinRequest = createAction<Request>("scrumlr.io/updateJoinRequest");
