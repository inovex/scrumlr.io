import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "../action";
import {API} from "../../api";

export const passNoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddNote) {
    API.addNote(action.context.board!, action.columnId, action.text); // FIXME handling
  }

  if (action.type === Action.DeleteNote) {
    API.deleteNote(action.context.board!, action.noteId).catch(() => {
      // FIXME error handling
    });
  }

  if (action.type === Action.EditNote) {
    API.editNote(action.context.board!, action.note, action.request).catch(() => {
      // FIXME error handling
    });
  }
};
