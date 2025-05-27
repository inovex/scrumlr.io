import {createAction} from "@reduxjs/toolkit";
import {Voting} from "./types";
import {Note} from "../notes";

export const createdVoting = createAction<Voting>("votings/createdVoting");

export const updatedVoting = createAction<{voting: Voting; notes?: Note[]}>("votings/updatedVoting");
