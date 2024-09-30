import {createAction} from "@reduxjs/toolkit";
import {Vote} from "./types";

export const createdVote = createAction<Vote>("votes/createdVote");

export const updatedVotes = createAction<Vote[]>("votes/updatedVotes");

export const deletedVote = createAction<Vote>("votes/deletedVote");
