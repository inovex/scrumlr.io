import {NotesState} from "types/note";
import {Action, ReduxAction} from "store/action";

// eslint-disable-next-line default-param-last
export const noteReducer = (state: NotesState = [], action: ReduxAction): NotesState => {
  switch (action.type) {
    case Action.InitializeBoard:
    case Action.UpdatedNotes: {
      return action.notes;
    }
  }
  return state;
};
