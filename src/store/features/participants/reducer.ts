import {createReducer} from "@reduxjs/toolkit";
import {Participant, ParticipantsState} from "./types";
import {initializeBoard} from "../board";
import {clearFocusInitiator, createdParticipant, setFocusInitiator, setParticipants, updatedParticipant} from "./actions";
import {editSelf} from "./thunks";

const initialState: ParticipantsState = {};

const mapParticipantsToState = (participants: Participant[], ownUserId: string): ParticipantsState => {
  const self = participants.find((p) => p.user.id === ownUserId)!;
  const others = participants.filter((p) => p.user.id !== ownUserId);
  const focusInitiator = undefined;

  return {self, others, focusInitiator};
};

export const participantsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => mapParticipantsToState(action.payload.fullBoard.participants, action.payload.self.id))
    .addCase(setParticipants, (_state, action) => mapParticipantsToState(action.payload.participants, action.payload.self.id))
    .addCase(createdParticipant, (state, action) => {
      state.others?.push(action.payload);
    })
    .addCase(updatedParticipant, (state, action) => {
      const isSelf = action.payload.participant.user.id === action.payload.self.id;
      if (isSelf) {
        state.self = action.payload.participant;
      } else {
        state.others = state.others?.map((p) => (p.user.id === action.payload.participant.user.id ? action.payload.participant : p));
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
