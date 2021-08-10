import {CookieClientModel} from "types/cookie";
import {ActionType, ReduxAction} from "store/action";

export const cookieReducer = (state: CookieClientModel = {name: null, value: null}, action: ReduxAction): CookieClientModel => {
  switch (action.type) {
    case ActionType.InitializeCookies: {
      return {
        name: "",
        value: false,
      };
    }
    case ActionType.AddCookie: {
      return {
        name: action.cookieName,
        value: action.cookieValue,
      };
    }
    default: {
      return state;
    }
  }
};
