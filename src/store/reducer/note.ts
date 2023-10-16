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
      const deletedNote = state.find((n) => n.id === action.noteId);

      // Delete stack
      if (action.deleteStack) {
        const newState = state.filter((n) => {
          if (n.id === action.noteId) {
            return false;
          }
          if (n.position.stack === action.noteId) {
            return false;
          }
          return true;
        });
        return newState.map((n) => {
          if (!n.position.stack && n.position.rank > deletedNote!.position.rank) {
            const newRank = n.position.rank - 1;
            return {...n, position: {...n.position, rank: newRank}};
          }
          return n;
        });
      }
      // Delete parent note
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
        const newState = state.map((note) => {
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
        return newState.filter((n) => n.id !== deletedNote.id);
      }
      // Delete child note
      if (deletedNote?.position.stack) {
        const newState = state.filter((n) => n.id !== action.noteId);
        return newState.map((n) => {
          if (n.position.stack === deletedNote.position.stack) {
            const newRank = n.position.rank - 1;
            return {...n, position: {...n.position, rank: newRank}};
          }
          return n;
        });
      }
      // Delete note
      const newState = state.filter((n) => n.id !== action.noteId);
      return newState.map((n) => {
        if (!n.position.stack && n.position.rank > deletedNote!.position.rank) {
          const newRank = n.position.rank - 1;
          return {...n, position: {...n.position, rank: newRank}};
        }
        return n;
      });
    }
    case Action.SyncNotes: {
      return action.notes;
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
