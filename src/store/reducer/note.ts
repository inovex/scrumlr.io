import Parse from "parse";
import {NoteClientModel} from "types/note";
import {ActionType, ReduxAction} from "store/action";

export const noteReducer = (state: NoteClientModel[] = [], action: ReduxAction): NoteClientModel[] => {
  switch (action.type) {
    case ActionType.AddNote: {
      const localNote: NoteClientModel = {
        columnId: action.columnId,
        text: action.text,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        author: Parse.User.current()!.id,
        focus: false,
        dirty: true,
      };
      return [...state, localNote];
    }
    case ActionType.CreatedNote: {
      const newState = [...state];
      const foundExistingNoteIndex = newState.findIndex((note) => !note.id && note.text === action.note.text);
      if (foundExistingNoteIndex >= 0) {
        newState.splice(foundExistingNoteIndex, 1, action.note);
      } else {
        newState.push(action.note);
      }
      return newState;
    }
    case ActionType.DeleteNote: {
      return state.filter((note) => note.id !== action.noteId);
    }
    case ActionType.EditNote: {
      const noteIndex = state.findIndex((note) => note.id === action.note.id);

      const newState = [...state];
      newState.splice(noteIndex, 1, {
        ...state[noteIndex],
        ...action.note,
        dirty: true,
      });
      return newState;
    }
    case ActionType.UpdatedNote: {
      const noteIndex = state.findIndex((note) => note.id === action.note.id);
      if (noteIndex >= 0) {
        const newState = [...state];
        newState.splice(noteIndex, 1, action.note);
        return newState;
      }
      return state;
    }
    case ActionType.InitializeNotes: {
      return [...action.notes];
    }
    default: {
      return state;
    }
  }
};
