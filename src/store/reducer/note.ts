import Parse from "parse";
import {NoteClientModel} from "../../types/note";
import {ActionType, ReduxAction} from "../action";

export const noteReducer = (state: NoteClientModel[] = [], action: ReduxAction): NoteClientModel[] => {
  switch (action.type) {
    case ActionType.AddNote: {
      const localNote: NoteClientModel = {
        columnId: action.columnId,
        text: action.text,
        author: Parse.User.current()!.id,
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
      const noteIndex = state.findIndex((note) => note.id === action.noteId);

      const newState = [...state];
      newState.splice(noteIndex, 1, {
        ...state[noteIndex],
        text: action.text,
        dirty: true,
      });
      return newState;
    }
    case ActionType.UpdatedNote: {
      const noteIndex = state.findIndex((note) => note.id === action.note.id);
      console.log(noteIndex);
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
  }
  return state;
};
