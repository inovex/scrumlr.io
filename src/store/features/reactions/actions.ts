import {createAction} from "@reduxjs/toolkit";
import {Reaction} from "./types";

// export const addReaction = createAction<{noteId: string; reactionType: ReactionType}>("scrumlr.io/addReaction");
export const addedReaction = createAction<Reaction>("scrumlr.io/addedReaction");

// export const updateReaction = createAction<{noteId: string; reactionType: ReactionType}>("scrumlr.io/updateReaction");
export const updatedReaction = createAction<Reaction>("scrumlr.io/updatedReaction");

// export const deleteReaction = createAction<string>("scrumlr.io/deleteReaction");
export const deletedReaction = createAction<string>("scrumlr.io/deletedReaction");
