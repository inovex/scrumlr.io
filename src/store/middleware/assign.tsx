import {API} from "api";
import {Button} from "components/Button";
import i18n from "i18n";
import {Dispatch, MiddlewareAPI} from "redux";
import store from "store";
import {Actions, ReduxAction} from "store/action";
import {AssignAction} from "store/action/assign";
import {ApplicationState} from "types";
import {Toast} from "utils/Toast";

export const passAssignMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === AssignAction.AddAssignee) {
    API.addAssignee(action.context.board!, action.note, action.name, action.id)
      .then((r) => {
        dispatch(Actions.assignedUser(r));
      })
      .catch(() => {
        Toast.error(
          <div>
            {/** TODO: error message refers to AddVote */}
            <div>{i18n.t("Error.addVote")}</div>
            <Button onClick={() => store.dispatch(Actions.addAssignee(action.note, action.name))}>{i18n.t("Error.retry")}</Button>
          </div>,
          false
        );
      });
    /* API. . . .  Backend missing o_o */
    console.log("add called");
  }
  if (action.type === AssignAction.RemoveAssignee) {
    /* API. . . .  Backend missing o_o */
    console.log("remove called");
  }
};
