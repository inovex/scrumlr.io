import {createReducer, isAnyOf} from "@reduxjs/toolkit";
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
      const note = state.find((n) => n.id === action.payload.noteId);

      if (!note) return state;

      // Delete stack
      if (action.payload.deleteStack) {
        const newState = state.filter((n) => {
          if (n.id === action.payload.noteId) {
            return false;
          }
          return n.position.stack !== action.payload.noteId;
        });
        return newState.map((n) => {
          if (!n.position.stack && n.position.rank > note.position.rank) {
            const newRank = n.position.rank - 1;
            return {...n, position: {...n.position, rank: newRank}};
          }
          return n;
        });
      }

      // Delete parent note
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
          if (n.position.stack === n.id) {
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
        const newState = state.filter((n) => n.id !== action.payload.noteId);
        return newState.map((n) => {
          if (n.position.stack === note.position.stack) {
            const newRank = n.position.rank - 1;
            return {...n, position: {...n.position, rank: newRank}};
          }
          return n;
        });
      }

      // Delete note
      const newState = state.filter((n) => n.id !== action.payload.noteId);
      return newState.map((n) => {
        if (!n.position.stack && n.position.rank > note.position.rank) {
          const newRank = n.position.rank - 1;
          return {...n, position: {...n.position, rank: newRank}};
        }
        return n;
      });
    })
    .addCase(updatedVoting, (_state, action) => action.payload.notes)
    .addMatcher(isAnyOf(updatedNotes, syncNotes), (_state, action) => action.payload)
);
