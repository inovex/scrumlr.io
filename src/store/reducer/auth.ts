import {AuthState} from "types/auth";
import {ReduxAction} from "store/action";
import {AuthAction} from "store/action/auth";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const authReducer = (state: AuthState = {user: undefined, initializationSucceeded: null}, action: ReduxAction): AuthState => {
  if (action.type === AuthAction.SignOut) {
    return {
      ...state,
      user: undefined,
    };
  }

  if (action.type === AuthAction.SignIn) {
    return {
      ...state,
      user: {
        id: action.id,
        name: action.name,
        avatar: action.avatar,
      },
    };
  }

  if (action.type === AuthAction.UserCheckCompleted) {
    return {
      ...state,
      initializationSucceeded: action.success,
    };
  }

  return state;
};
