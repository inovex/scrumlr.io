import {createReducer} from "@reduxjs/toolkit";
import store from "store";
import {Participant, ParticipantsState} from "./types";
import {initializeBoard} from "../board";
import {setParticipants} from "./actions";

const initialState: ParticipantsState = {};

const mapParticipantsToState = (participants: Participant[]): ParticipantsState => {
  const ownUserId: string = store.getState().auth.user?.id;

  const self = participants.find((p) => p.user.id === ownUserId)!;
  const others = participants.filter((p) => p.user.id !== ownUserId);
  const focusInitiator = undefined;

  return {self, others, focusInitiator};
};

export const participantsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => mapParticipantsToState(action.payload.participants))
    .addCase(setParticipants, (_state, action) => mapParticipantsToState(action.payload))
);
