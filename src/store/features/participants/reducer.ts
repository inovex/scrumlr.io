import {createReducer} from "@reduxjs/toolkit";
import {store} from "store";
import {Participant, ParticipantsState} from "./types";
import {initializeBoard} from "../board";
import {clearFocusInitiator, createdParticipant, setFocusInitiator, setParticipants, updatedParticipant} from "./actions";
import {editSelf} from "./thunks";

const initialState: ParticipantsState = {};

const mapParticipantsToState = (participants: Participant[]): ParticipantsState => {
  const ownUserId = store.getState().auth.user?.id;

  const self = participants.find((p) => p.user.id === ownUserId)!;
  const others = participants.filter((p) => p.user.id !== ownUserId);
  const focusInitiator = undefined;

  return {self, others, focusInitiator};
};

export const participantsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => mapParticipantsToState(action.payload.participants))
    .addCase(setParticipants, (_state, action) => mapParticipantsToState(action.payload))
    .addCase(createdParticipant, (state, action) => {
      state.others?.push(action.payload);
    })
    .addCase(updatedParticipant, (state, action) => {
      const isSelf = action.payload.user.id === store.getState().auth.user?.id;
      if (isSelf) {
        state.self = action.payload;
      } else {
        state.others = state.others?.map((p) => (p.user.id === action.payload.user.id ? action.payload : p));
      }
    })
    .addCase(editSelf.fulfilled, (state, action) => {
      if (state.self?.user) {
        state.self.user = action.payload;
      }
    })
    .addCase(setFocusInitiator, (state, action) => {
      state.focusInitiator = action.payload;
    })
    .addCase(clearFocusInitiator, (state) => {
      state.focusInitiator = undefined;
    })
);
