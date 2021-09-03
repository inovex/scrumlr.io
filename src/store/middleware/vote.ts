import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import {Toast} from "utils/Toast";
import {ActionType, ReduxAction} from "../action";

export const passVoteMiddlware = async (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.AddVote) {
    const boardId = stateAPI.getState().board.data!.id;
    const response = (await API.addVote(boardId, action.note)) as {status: string; description: string};
    if (response.status === "Error") {
      Toast.error(response.description);
    }
  }

  if (action.type === ActionType.DeleteVote) {
    const boardId = stateAPI.getState().board.data!.id;
    API.deleteVote(boardId, action.note);
  }
};
