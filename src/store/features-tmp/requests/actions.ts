import {createAction} from "@reduxjs/toolkit";
import {Request} from "./types";

export const initializeJoinRequests = createAction<Request[]>("scrumlr.io/initializeJoinRequests");
export const createJoinRequest = createAction<Request>("scrumlr.io/createJoinRequest");

export const updateJoinRequest = createAction<Request>("scrumlr.io/updateJoinRequest");

export const acceptJoinRequests = createAction<string[]>("scrumlr.io/acceptJoinRequests");
export const rejectJoinRequests = createAction<string[]>("scrumlr.io/rejectJoinRequests");
