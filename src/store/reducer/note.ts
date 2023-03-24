import {Action, ReduxAction} from "store/action";
import {NotesState} from "types/note";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const noteReducer = (state: NotesState = [], action: ReduxAction): NotesState => {
  switch (action.type) {
    case Action.InitializeBoard:
    case Action.UpdatedNotes: {
      return action.notes;
    }
    case Action.DeletedNote: {
      // Delete stack
      if (action.deleteStack) {
        return state.filter((n) => {
          if (n.id === action.noteId) {
            return false;
          }
          if (n.position.stack === action.noteId) {
            return false;
          }
          return true;
        });
      }

      // Delete parent note
      const deletedNote = state.find((n) => n.id === action.noteId);
      const childrenOfDeletedNote = state.filter((n) => n.position.stack === deletedNote?.id);
      if (deletedNote?.position.stack === null && childrenOfDeletedNote.length > 0) {
        // Find the next parent note among its children
        const nextParentNote = childrenOfDeletedNote.reduce((acc, curr) => {
          if (curr.position.rank > acc.position.rank) {
            return curr;
          }
          return acc;
        }, childrenOfDeletedNote[0]);

        // Update the children notes' stack to the next parent note's ID
        const updatedNotes = state.map((note) => {
          if (note.id === nextParentNote.id) {
            // The next parent note should now have null stack
            return {...note, position: {...note.position, stack: null, rank: deletedNote.position.rank}}; // rank
          }
          if (note.position.stack === deletedNote.id) {
            // The other children should now have the next parent note's ID as their stack
            return {...note, position: {...note.position, stack: nextParentNote.id}};
          }
          return note;
        });

        // Delete the old parent note
        return updatedNotes.filter((n) => n.id !== deletedNote.id);
      }
      return state.filter((n) => n.id !== action.noteId);
    }
    case Action.UpdatedVoting: {
      if (action.notes) {
        return action.notes;
      }
      return state;
    }
    default:
      return state;
  }
};
