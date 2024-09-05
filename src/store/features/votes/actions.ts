import {createAction} from "@reduxjs/toolkit";
import {Vote} from "./types";

// export const addVote = createAction<string>("scrumlr.io/addVote");
export const createdVote = createAction<Vote>("scrumlr.io/createdVote");

export const updatedVotes = createAction<Vote[]>("scrumlr.io/updatedVotes");

// export const deleteVote = createAction<string>("scrumlr.io/deleteVote");
export const deletedVote = createAction<Vote>("scrumlr.io/deletedVote");
