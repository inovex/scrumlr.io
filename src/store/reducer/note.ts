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
      return state.filter((n) => n.id !== action.noteId);
    }
    case Action.UpdatedVoting: {
      if (action.notes) {
        return action.notes;
      }
      return state;
    }
    case Action.DeleteNoteTemporary: {
      return state.filter((n) => n.id !== action.noteId);
    }
    case Action.ReAddNote: {
      return state.concat(action.note);
    }
    case Action.UnstackNoteTemporary: {
      const note = state.find((n) => n.id === action.noteId)!;
      const parent = state.find((n) => n.id === note!.position.stack)!;
      note.position.stack = undefined;
      note.position.rank = Math.max(parent.position.rank - 1, 0);
      return state.map((n) => {
        if (n.id === note.id) {
          return note;
        } if (n.id === parent.id) {
          return parent;
        }
        return n;
      });
    }
    // case Action.ReStackNote: {
    //   // return
    // }
    default:
      return state;
  }
};
