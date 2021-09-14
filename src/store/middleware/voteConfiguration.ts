import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import {Toast} from "utils/Toast";
import {ActionType, ReduxAction} from "../action";

export const passVoteConfigurationMiddlware = async (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.UpdateVoteConfiguration) {
    API.updateVoteConfiguration(action.voteConfiguration);
  }

  const boardId = stateAPI.getState().board.data!.id;

  if (action.type === ActionType.AddVoteConfiguration) {
    const response = (await API.addVoteConfiguration(boardId, action.voteConfiguration)) as {status: string; description: string};
    if (response.status === "Error") {
      Toast.error(response.description);
    }
  }

  if (action.type === ActionType.RemoveVoteConfiguration) {
    API.removeVoteConfiguration(boardId);
  }
};
