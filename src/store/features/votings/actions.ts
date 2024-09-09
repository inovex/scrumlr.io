import {createAction} from "@reduxjs/toolkit";
import {Voting} from "./types";
import {Note} from "../notes";

export const createdVoting = createAction<Voting>("scrumlr.io/createdVoting");

export const updatedVoting = createAction<{voting: Voting; notes?: Note[]}>("scrumlr.io/updatedVoting");
