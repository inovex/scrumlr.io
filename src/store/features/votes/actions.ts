import {createAction} from "@reduxjs/toolkit";
import {Vote} from "./types";

export const createdVote = createAction<Vote>("scrumlr.io/createdVote");

export const updatedVotes = createAction<Vote[]>("scrumlr.io/updatedVotes");

export const deletedVote = createAction<Vote>("scrumlr.io/deletedVote");
