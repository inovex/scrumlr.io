import {createAction} from "@reduxjs/toolkit";
import {ParticipantWithUser} from "./types";
import {Auth} from "../auth";

export const setParticipants = createAction<{participants: ParticipantWithUser[]; self: Auth}>("participants/setParticipants");

export const createdParticipant = createAction<ParticipantWithUser>("participants/createdParticipant");
export const updatedParticipant = createAction<{participant: ParticipantWithUser; self: Auth}>("participants/updatedParticipant");

export const setFocusInitiator = createAction<ParticipantWithUser>("participants/setFocusInitiator");
export const clearFocusInitiator = createAction("participants/clearFocusInitiator");
