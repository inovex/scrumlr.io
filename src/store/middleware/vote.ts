import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import {ActionType, ReduxAction} from "../action";

export const passVoteMiddlware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.AddVote) {
    const boardId = stateAPI.getState().board.data!.id;
    API.addVote(boardId, action.note);
  }

  if (action.type === ActionType.DeleteVote) {
    const boardId = stateAPI.getState().board.data!.id;
    API.deleteVote(boardId, action.note);
  }
};
