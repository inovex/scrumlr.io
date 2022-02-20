import {UserState} from "../../types/store";
import {ReduxAction} from "../action";
import {UserActionType} from "../action/user";

export const userReducer = (state: UserState = {user: undefined, initialized: false}, action: ReduxAction): UserState => {
  if (action.type === UserActionType.SignOut) {
    return {
      ...state,
      user: undefined,
      initialized: true,
    };
  }

  if (action.type === UserActionType.SignIn) {
    return {
      ...state,
      user: {
        id: action.id,
        name: action.name,
      },
      initialized: true,
    };
  }

  if (action.type === UserActionType.UserCheckCompleted) {
    return {
      ...state,
      initialized: true,
    };
  }

  return state;
};
