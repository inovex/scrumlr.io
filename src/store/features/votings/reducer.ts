import { createReducer } from "@reduxjs/toolkit";
import { VotingsState } from "./types";
import { initializeBoard } from "../board";
import { createdVoting, syncedVotingResults, updatedVoting } from "./actions";

const initialState: VotingsState = { open: undefined, past: [] };

export const votingsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) =>
      action.payload.fullBoard.votings.reduce<VotingsState>(
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
    .addCase(syncedVotingResults, (state, action) => {
      const index = state.past.findIndex((voting) => voting.id === action.payload.id);
      if (index !== -1) {
        state.past[index] = action.payload;
      }
    })
);
