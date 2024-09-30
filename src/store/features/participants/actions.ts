import {createAction} from "@reduxjs/toolkit";
import {Participant} from "./types";
import {Auth} from "../auth";

export const setParticipants = createAction<{participants: Participant[]; self: Auth}>("participants/setParticipants");

export const createdParticipant = createAction<Participant>("participants/createdParticipant");
export const updatedParticipant = createAction<{participant: Participant; self: Auth}>("participants/updatedParticipant");

export const setFocusInitiator = createAction<Participant>("participants/setFocusInitiator");
export const clearFocusInitiator = createAction("participants/clearFocusInitiator");
