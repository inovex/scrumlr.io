import {createReducer, isAnyOf} from "@reduxjs/toolkit";
import {deletedColumn} from "store/features/columns";
import {NotesState} from "./types";
import {initializeBoard} from "../board";
import {deletedNote, syncNotes, updatedNotes} from "./actions";
import {updatedVoting} from "../votings";

const initialState: NotesState = [];

export const notesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(initializeBoard, (_state, action) => action.payload.fullBoard.notes)
    .addCase(updatedNotes, (_state, action) => action.payload)
    .addCase(deletedNote, (state, action) => {
      const note = state.find((n) => n.id === action.payload);

      if (!note) return state;

      // all note deletions are now single operations; so we don't do stack deletions as a whole.
      // if the note is part of a stack, we only delete itself and reorder the other notes accordingly.
      // instead of a stack deletion, all notes will be deleted one by one synchronously, eventually deleting the stack.

      // Delete parent note
      // first child note becomes the new parent
      const childrenOfDeletedNote = state.filter((n) => n.position.stack === note.id);
      if (note.position.stack === null && childrenOfDeletedNote.length > 0) {
        // Find the next parent note among its children
        const nextParentNote = childrenOfDeletedNote.reduce((acc, curr) => {
          if (curr.position.rank > acc.position.rank) {
            return curr;
          }
          return acc;
        }, childrenOfDeletedNote[0]);

        // Update the children notes' stack to the next parent note's ID
        const newState = state.map((n) => {
          if (n.id === nextParentNote.id) {
            // The next parent n should now have null stack
            return {...n, position: {...n.position, stack: null, rank: n.position.rank}};
          }
          if (n.position.stack === note.id) {
            // The other children should now have the next parent n's ID as their stack
            return {...n, position: {...n.position, stack: nextParentNote.id}};
          }
          return n;
        });

        // Delete the old parent note
        return newState.filter((n) => n.id !== note.id);
      }

      // Delete child note
      if (note.position.stack) {
        const newState = state.filter((n) => n.id !== action.payload);
        return newState.map((n) => {
          if (n.position.stack === note.position.stack) {
            const newRank = n.position.rank - 1;
            return {...n, position: {...n.position, rank: newRank}};
          }
          return n;
        });
      }

      // Delete a single note
      const newState = state.filter((n) => n.id !== action.payload);
      return newState.map((n) => {
        if (!n.position.stack && n.position.rank > note.position.rank) {
          const newRank = n.position.rank - 1;
          return {...n, position: {...n.position, rank: newRank}};
        }
        return n;
      });
    })
    .addCase(deletedColumn, (state, action) => state.filter((note) => note.position.column !== action.payload))
    .addCase(updatedVoting, (_state, action) => action.payload.notes)
    .addMatcher(isAnyOf(updatedNotes, syncNotes), (_state, action) => action.payload)
);
