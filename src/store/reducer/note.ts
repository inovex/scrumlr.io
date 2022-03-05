import {NotesState} from "types/note";
import {ReduxAction} from "store/action";

// eslint-disable-next-line default-param-last
export const noteReducer = (state: NotesState = [], action: ReduxAction): NotesState => state;
