import {createAction} from "@reduxjs/toolkit";
import {Participant} from "./types";
import {Auth} from "../auth";

export const setParticipants = createAction<{participants: Participant[]; self: Auth}>("scrumlr.io/setParticipants");

export const createdParticipant = createAction<Participant>("scrumlr.io/createdParticipant");
export const updatedParticipant = createAction<{participant: Participant; self: Auth}>("scrumlr.io/updatedParticipant");

export const setFocusInitiator = createAction<Participant>("scrumlr.io/setFocusInitiator");
export const clearFocusInitiator = createAction("scrumlr.io/clearFocusInitiator");
