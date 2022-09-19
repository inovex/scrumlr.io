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
    default:
      return state;
  }
};
