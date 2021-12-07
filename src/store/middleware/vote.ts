import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import {Toast} from "utils/Toast";
import {StatusResponse} from "types";
import Parse from "parse";
import {ActionType, ReduxAction} from "../action";

export const passVoteMiddlware = async (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.AddVote) {
    const boardId = stateAPI.getState().board.data!.id;
    const user = Parse.User.current()?.id!;
    const {length} = stateAPI.getState().votes.filter((v) => v.user === user);
    const allowed = stateAPI.getState().voteConfiguration.voteLimit;
    if (length < allowed) {
      const response = (await API.addVote(boardId, action.note)) as StatusResponse;
      stateAPI.getState().votes.filter((v) => v.user === user);
      if (response.status === "Error") {
        Toast.error(response.description);
      }
    }
  }

  if (action.type === ActionType.DeleteVote) {
    const user = Parse.User.current()?.id!;
    const {length} = stateAPI.getState().votes.filter((v) => v.user === user);
    if (length !== 0) {
      const boardId = stateAPI.getState().board.data!.id;
      API.deleteVote(boardId, action.note);
    }
  }
};
