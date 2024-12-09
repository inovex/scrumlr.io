import {createReducer} from "@reduxjs/toolkit";
import {VotesState} from "./types";
import {initializeBoard} from "../board";
import {createdVote, deletedVote, deletedVotes, updatedVotes} from "./actions";
import {createdVoting} from "../votings";

const initialState: VotesState = [];

export const votesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => action.payload.fullBoard.votes)
    .addCase(createdVote, (state, action) => {
      state.push(action.payload);
    })
    .addCase(updatedVotes, (_state, action) => action.payload)
    .addCase(deletedVotes, (_state, action) => _state.filter((vote) => !action.payload.some((deleteVote) => deleteVote.note === vote.note)))
    .addCase(deletedVote, (state, action) => {
      const newVotes = state.slice();
      const index = newVotes.findIndex((v) => v.voting === action.payload.voting && v.note === action.payload.note);
      if (index >= 0) {
        newVotes.splice(index, 1);
        return newVotes;
      }
      return state;
    })
    .addCase(createdVoting, () => [])
);
