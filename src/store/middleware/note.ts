import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {ActionType, ReduxAction} from "../action";
import {API} from "api";

export const passNoteMiddleware = (stateAPI: MiddlewareAPI<any, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
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
        API.editNote(action.noteId, action.text);
    }
}