import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import Parse from "parse";
import {Toast} from "utils/Toast";
import {ActionType, ReduxAction} from "../action";

export const passUsersMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.ChangePermission) {
    const boardId = stateAPI.getState().board.data!.id;
    API.changePermission(action.userId, boardId, action.moderator);
  } else if (action.type === ActionType.EditUserConfiguration) {
    const boardId = stateAPI.getState().board.data!.id;
    API.editUserConfiguration(boardId, action.userConfigurationRequest);
  } else if (action.type === ActionType.SetUserReadyStatus) {
    const boardId = stateAPI.getState().board.data!.id;
    API.setReadyStatus(boardId, action.ready);
  } else if (action.type === ActionType.SetRaisedHandStatus) {
    const boardId = stateAPI.getState().board.data!.id;
    API.setRaisedHandStatus(boardId, action.configuration);
  } else if (action.type === ActionType.UpdatedBoard) {
    const onlineUsers = stateAPI.getState().users.all.filter((user) => user.online === true);
    if (onlineUsers.length > 1) {
      const unreadyUsers = onlineUsers.filter((user) => user.ready === false);
      if (unreadyUsers.length === 1 && unreadyUsers[0].id === Parse.User.current()!.id) {
        Toast.error(`You are the last one not ready yet, hurry-up!`);
      }
    }
  }
};
