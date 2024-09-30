import {createReducer} from "@reduxjs/toolkit";
import {VotesState} from "./types";
import {initializeBoard} from "../board";
import {createdVote, deletedVote, updatedVotes} from "./actions";

const initialState: VotesState = [];

export const votesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => action.payload.fullBoard.votes)
    .addCase(createdVote, (state, action) => {
      state.push(action.payload);
    })
    .addCase(updatedVotes, (_state, action) => action.payload)
    .addCase(deletedVote, (state, action) => state.filter((v) => !(v.voting === action.payload.voting && v.note === action.payload.note)))
);
