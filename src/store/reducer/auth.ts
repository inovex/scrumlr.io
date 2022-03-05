import {AuthState} from "types/auth";
import {ReduxAction} from "../action";
import {AuthAction} from "../action/auth";

export const authReducer = (state: AuthState = {user: undefined, initialized: false}, action: ReduxAction): AuthState => {
  if (action.type === AuthAction.SignOut) {
    return {
      ...state,
      user: undefined,
      initialized: true,
    };
  }

  if (action.type === AuthAction.SignIn) {
    return {
      ...state,
      user: {
        id: action.id,
        name: action.name,
      },
      initialized: true,
    };
  }

  if (action.type === AuthAction.UserCheckCompleted) {
    return {
      ...state,
      initialized: true,
    };
  }

  return state;
};
