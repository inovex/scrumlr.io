import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "../action";
import {API} from "../../api";

export const passNoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddNote) {
    API.addNote(action.session.board!, action.columnId, action.text); // FIXME handling
  }
};
