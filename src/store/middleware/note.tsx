import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import {Button} from "../../components/Button";
import store from "../index";

export const passNoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddNote) {
    API.addNote(action.context.board!, action.columnId, action.text).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.addNote")}</div>
          <Button onClick={() => store.dispatch(Actions.addNote(action.columnId, action.text))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }

  if (action.type === Action.DeleteNote) {
    const sharedNoteId = stateAPI.getState().board.data?.sharedNote;
    const currentNoteId = action.noteId;
    const {moderating} = stateAPI.getState().view;

    if (sharedNoteId === currentNoteId && !moderating) {
      Toast.error(
        <div>
          <div>{i18n.t("Error.deleteNoteWhenShared")}</div>
        </div>,
        5000
      );
    } else {
      API.deleteNote(action.context.board!, action.noteId, action.deleteStack).catch(() => {
        Toast.error(
          <div>
            <div>{i18n.t("Error.deleteNote")}</div>
            <Button onClick={() => store.dispatch(Actions.deleteNote(action.noteId))}>{i18n.t("Error.retry")}</Button>
          </div>
        );
      });
    }
  }

  if (action.type === Action.EditNote) {
    API.editNote(action.context.board!, action.note, action.request).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.editNote")}</div>
          <Button onClick={() => store.dispatch(Actions.editNote(action.note, action.request))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }

  if (action.type === Action.UnstackNote) {
    const note = stateAPI.getState().notes.find((n) => n.id === action.note)!;
    const parent = stateAPI.getState().notes.find((n) => n.id === note.position.stack)!;

    API.editNote(action.context.board!, action.note, {position: {column: note.position.column, stack: null, rank: Math.max(parent.position.rank - 1, 0)}}).catch(() => {
      Toast.error(
        <div>
          <div>{i18n.t("Error.unstackNote")}</div>
          <Button onClick={() => store.dispatch(Actions.unstackNote(action.note))}>{i18n.t("Error.retry")}</Button>
        </div>
      );
    });
  }
};
