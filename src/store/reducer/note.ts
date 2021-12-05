import Parse from "parse";
import {NoteClientModel} from "types/note";
import {ActionType, ReduxAction} from "store/action";

// eslint-disable-next-line default-param-last
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
        positionInStack: -1,
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
      const newState: NoteClientModel[] = state;

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
    case ActionType.DragNote: {
      const dragedOn = state.find((note) => note.id === action.note.dragOnId);
      const note = state.find((noteInList) => noteInList.id === action.note.id);
      const childNotes = (state.filter((noteInList) => noteInList.parentId === action.note.id) as NoteClientModel[]) ?? [];
      if (dragedOn) {
        const childNotesDragedOn = (state.filter((noteInList) => noteInList.parentId === action.note.dragOnId) as NoteClientModel[]) ?? [];

        dragedOn!.parentId = action.note.id;
        dragedOn!.positionInStack = childNotes.length + 1;

        childNotesDragedOn
          .sort((a, b) => a.positionInStack - b.positionInStack)
          .forEach((child, index) => {
            child.parentId = action.note.id;
            child.positionInStack = index + childNotes.length + 2;
          });

        note!.positionInStack = 0;
      }

      if (action.note.columnId) {
        note!.columnId = action.note.columnId;
        childNotes.forEach((childNote) => {
          childNote.columnId = action.note.columnId!;
        });
      }
      return state;
    }
    case ActionType.UnstackNote: {
      const unstack = state.find((note) => note.id === action.note.id);
      unstack!.parentId = undefined;
      unstack!.positionInStack = -1;

      const childNotes = (state.filter((note) => note.parentId === action.note.parentId) as NoteClientModel[]) ?? [];
      if (childNotes.length === 0) {
        const parent = state.find((note) => note.id === action.note.parentId);
        parent!.positionInStack = -1;
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
