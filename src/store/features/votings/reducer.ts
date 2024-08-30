import {createReducer} from "@reduxjs/toolkit";
import {VotingsState} from "./types";
import {initializeBoard} from "../board";
import {createdVoting, updatedVoting} from "./actions";

const initialState: VotingsState = {open: undefined, past: []};

export const votingsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) =>
      action.payload.votings.reduce<VotingsState>(
        (acc, voting) => {
          if (voting.status === "OPEN") {
            acc.open = voting;
          } else {
            acc.past.push(voting);
          }
          return acc;
        },
        {open: undefined, past: []}
      )
    )
    .addCase(createdVoting, (state, action) => {
      state.open = action.payload;
    })
    .addCase(updatedVoting, (state, action) => {
      state.open = undefined;
      state.past.push(action.payload.voting);
    })
);
