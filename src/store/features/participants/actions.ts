import {createAction} from "@reduxjs/toolkit";
import {Participant} from "./types";
import {Auth} from "../auth";

export const setParticipants = createAction<{participants: Participant[]; self: Auth}>("scrumlr.io/setParticipants");

export const createdParticipant = createAction<Participant>("scrumlr.io/createdParticipant");
export const updatedParticipant = createAction<{participant: Participant; self: Auth}>("scrumlr.io/updatedParticipant");

// export const editSelf = createAction<Auth>("scrumlr.io/editSelf");
// export const changePermission = createAction<{userId: string; moderator: boolean}>("scrumlr.io/changePermission");

// export const setUserBanned = createAction<{user: Auth; banned: boolean}>("scrumlr.io/setUserBanned");
// export const setUserReadyStatus = createAction<{user: string; ready: boolean}>("scrumlr.io/setUserReadyStatus");
// export const setRaisedHandStatus = createAction<{user: string; raisedHand: boolean}>("scrumlr.io/setRaisedHandStatus");
// export const setShowHiddenColumns = createAction<boolean>("scrumlr.io/setShowHiddenColumns");
export const setFocusInitiator = createAction<Participant>("scrumlr.io/setFocusInitiator");
export const clearFocusInitiator = createAction("scrumlr.io/clearFocusInitiator");
