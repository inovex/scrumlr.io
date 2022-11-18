import {Dispatch, MiddlewareAPI} from "redux";
import {ReduxAction} from "store/action";
import {AssigneeAction} from "store/action/assignee";
import {ApplicationState} from "types";

export const passAssigneeMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === AssigneeAction.AddAssignee) {
    /* API. . . .  Backend missing o_o */
  }
  if (action.type === AssigneeAction.RemoveAssignee) {
    /* API. . . .  Backend missing o_o */
  }
};
