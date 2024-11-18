import {createReducer} from "@reduxjs/toolkit";
import {VotesState} from "./types";
import {initializeBoard} from "../board";
import {createdVote, deletedVote, updatedVotes} from "./actions";
import {createdVoting, updatedVoting} from "../votings";

const initialState: VotesState = [];

export const votesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => action.payload.fullBoard.votes)
    .addCase(createdVote, (state, action) => {
      state.push(action.payload);
    })
    .addCase(updatedVoting, (_state, action) => action.payload.notes?.map((n) => ({voting: action.payload.voting.id, note: n.id})))
    .addCase(updatedVotes, (_state, action) => action.payload)
    .addCase(deletedVote, (state, action) => state.filter((v) => !(v.voting === action.payload.voting && v.note === action.payload.note)))
    .addCase(createdVoting, () => [])
);
