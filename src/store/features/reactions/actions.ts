import {createAction} from "@reduxjs/toolkit";
import {Reaction} from "./types";

export const addedReaction = createAction<Reaction>("scrumlr.io/addedReaction");

export const updatedReaction = createAction<Reaction>("scrumlr.io/updatedReaction");

export const deletedReaction = createAction<string>("scrumlr.io/deletedReaction");
