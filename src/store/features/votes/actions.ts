import {createAction} from "@reduxjs/toolkit";
import {Vote} from "./types";

export const createdVote = createAction<Vote>("votes/createdVote");

export const deletedVote = createAction<Pick<Vote, "voting" | "note">>("votes/deletedVote");

export const updatedVotes = createAction<Vote[]>("votes/updatedVotes");

export const deletedVotes = createAction<Pick<Vote, "voting" | "note">[]>("votes/deletedVotes");
