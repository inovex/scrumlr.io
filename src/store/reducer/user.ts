import {UserState} from "../../types/store";
import {ReduxAction} from "../action";
import {UserActionType} from "../action/user";

export const userReducer = (state: UserState = {user: undefined}, action: ReduxAction): UserState => {
  if (action.type === UserActionType.SignOut) {
    return {
      user: undefined,
    };
  }

  if (action.type === UserActionType.SignIn) {
    return {
      user: {
        id: action.id,
        name: action.name,
      },
    };
  }

  return state;
};
