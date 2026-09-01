import { createReducer } from "@reduxjs/toolkit";
import { VotingsState } from "./types";
import { createdVoting, updatedVoting} from "./actions";
import {getAllVotings} from "./thunks";

const initialState: VotingsState = { open: undefined, past: [] };

export const votingsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(getAllVotings.fulfilled, (_state, action) =>
      //TODO
      action.payload.reduce<VotingsState>(
        (acc, voting) => {
          if (voting.status === "OPEN") {
            acc.open = voting;
          } else {
            acc.past.push(voting);
          }
          return acc;
        },
        { open: undefined, past: [] }
      )
    )
    .addCase(createdVoting, (state, action) => {
      state.open = action.payload;
    })
    .addCase(updatedVoting, (state, action) => {
      state.open = undefined;
      const incoming = action.payload.voting;
      const lastKnown = state.past[0];
      const votingToPush = incoming.votes ? incoming : { ...incoming, votes: lastKnown?.votes };
      state.past.unshift(votingToPush);
    })
);
