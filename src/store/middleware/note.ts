import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import {ActionType, ReduxAction} from "../action";

export const passNoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.AddNote) {
    const boardId = stateAPI.getState().board.data!.id;
    // TODO retry mechanism
    API.addNote(boardId, action.columnId, action.text);
  }

  if (action.type === ActionType.DeleteNote) {
    // TODO retry mechanism
    API.deleteNote(action.noteId);
  }

  if (action.type === ActionType.EditNote) {
    // TODO retry mechanism
    API.editNote(action.note);
  }

  if (action.type === ActionType.UnstackNote) {
    // TODO retry mechanism
    const boardId = stateAPI.getState().board.data!.id;
    API.unstackNote(action.note, boardId);
  }
};
