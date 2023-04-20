import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";
import {Toast} from "../../utils/Toast";
import i18n from "../../i18n";
import store from "../index";

export const passNoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddNote) {
    API.addNote(action.context.board!, action.columnId, action.text).catch(() => {
      Toast.error({
        title: i18n.t("Error.addNote"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.addNote(action.columnId, action.text)),
      });
    });
  }

  if (action.type === Action.DeleteNote) {
    const sharedNoteId = stateAPI.getState().board.data?.sharedNote;
    const currentNoteId = action.noteId;
    const {moderating} = stateAPI.getState().view;

    if (sharedNoteId === currentNoteId && !moderating) {
      Toast.error({title: i18n.t("Error.deleteNoteWhenShared")});
    } else {
      API.deleteNote(action.context.board!, action.noteId).catch(() => {
        Toast.error({
          title: i18n.t("Error.deleteNote"),
          buttons: [i18n.t("Error.retry")],
          firstButtonOnClick: () => store.dispatch(Actions.deleteNote(action.noteId)),
        });
      });
    }
  }

  if (action.type === Action.EditNote) {
    API.editNote(action.context.board!, action.note, action.request).catch(() => {
      Toast.error({
        title: i18n.t("Error.editNote"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.editNote(action.note, action.request)),
      });
    });
  }

  if (action.type === Action.UnstackNote) {
    const note = stateAPI.getState().notes.find((n) => n.id === action.note)!;
    const parent = stateAPI.getState().notes.find((n) => n.id === note.position.stack)!;

    API.editNote(action.context.board!, action.note, {position: {column: note.position.column, stack: undefined, rank: Math.max(parent.position.rank - 1, 0)}}).catch(() => {
      Toast.error({
        title: i18n.t("Error.unstackNote"),
        buttons: [i18n.t("Error.retry")],
        firstButtonOnClick: () => store.dispatch(Actions.unstackNote(action.note)),
      });
    });
  }
};
