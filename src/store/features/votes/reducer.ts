import {createReducer} from "@reduxjs/toolkit";
import {VotesState} from "./types";
import {initializeBoard} from "../board";
import {createdVote, deletedVote, deletedVotes, updatedVotes} from "./actions";
import {createdVoting} from "../votings";

// Initialize the state as an object with a 'data' property
const initialState: VotesState = {data: []};

export const votesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => ({data: action.payload.fullBoard.votes}))
    .addCase(createdVote, (state, action) => {
      state.data.push(action.payload);
    })
    .addCase(updatedVotes, (_state, action) => ({data: action.payload}))
    .addCase(deletedVotes, (state, action) => ({data: state.data.filter((vote) => !action.payload.some((deleteVote) => deleteVote.note === vote.note))}))
    .addCase(deletedVote, (state, action) => {
      const newVotes = state.data.slice();
      const index = newVotes.findIndex((v) => v.voting === action.payload.voting && v.note === action.payload.note);
      if (index >= 0) {
        newVotes.splice(index, 1);
        return {data: newVotes};
      }
      return state;
    })
    .addCase(createdVoting, () => ({data: []}))
);
