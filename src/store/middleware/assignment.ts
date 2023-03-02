import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "store/action";
import {API} from "api";

export const passAssignmentMiddlware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.CreateAssignment) {
    API.createAssignment(action.context.board!, action.noteId, action.name);
  }
  if (action.type === Action.DeleteAssignment) {
    API.deleteAssignment(action.context.board!, action.assignmentId);
  }
};
