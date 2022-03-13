import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, Actions, ReduxAction} from "store/action";
import {API} from "api";

export const passVoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddVote) {
    API.addVote(action.context.board!, action.note)
      .then((r) => {
        dispatch(Actions.createdVote(r));
      })
      .catch(() => {
        // TODO show error
      });
  }

  if (action.type === Action.DeleteVote) {
    API.deleteVote(action.context.board!, action.note)
      .then(() => {
        dispatch(Actions.deletedVote({voting: action.context.voting!, note: action.note}));
      })
      .catch(() => {
        // TODO show error
      });
  }
};
