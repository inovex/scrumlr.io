import {createAction} from "@reduxjs/toolkit";
import {Reaction} from "./types";

export const addedReaction = createAction<Reaction>("reactions/addedReaction");

export const updatedReaction = createAction<Reaction>("reactions/updatedReaction");

export const deletedReaction = createAction<string>("reactions/deletedReaction");
