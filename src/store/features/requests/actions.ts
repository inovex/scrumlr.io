import {createAction} from "@reduxjs/toolkit";
import {Request} from "./types";

export const createJoinRequest = createAction<Request>("requests/createJoinRequest");

export const updateJoinRequest = createAction<Request>("requests/updateJoinRequest");
