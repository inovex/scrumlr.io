import {createAsyncThunk} from "@reduxjs/toolkit";
import {signIn, userCheckCompleted} from "store/features/auth/actions";
import {ACCOUNT_TYPE_ANONYMOUS} from "store/features/auth/types";
import {API} from "api";

// TODO Toasts
export const initAuth = createAsyncThunk("scrumlr.io/setTimer", async (_payload, {dispatch}) => {
  API.getCurrentUser()
    .then((user) => {
      if (user) {
        const isAnonymous = user.accountType === ACCOUNT_TYPE_ANONYMOUS;
        dispatch(signIn({id: user.id, name: user.name, isAnonymous, avatar: user.avatar}));
      }
      dispatch(userCheckCompleted(true));
    })
    .catch(() => {
      dispatch(userCheckCompleted(false));
    });
});

// use createAsyncThunk, because the action also changes state in the reducer.
export const signOut = createAsyncThunk("scrumlr.io/signOut", async () => {
  API.signOut().then(() => {
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  });
});

/*
export const passAuthMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ViewAction.InitApplication) {
    API.getCurrentUser()
      .then((user) => {
        if (user) {
          const isAnonymous = user.accountType === ACCOUNT_TYPE_ANONYMOUS;
          dispatch(Actions.signIn(user.id, user.name, isAnonymous, user.avatar));
        }
        dispatch(Actions.userCheckCompleted(true));
      })
      .catch(() => {
        i18n.on("loaded", () => {
          Toast.error({
            title: i18n.t("Error.serverConnection"),
            buttons: [i18n.t("Error.retry")],
            firstButtonOnClick: () => store.dispatch(Actions.initApplication()),
            autoClose: false,
          });
        });
        dispatch(Actions.userCheckCompleted(false));
      });
  }

  if (action.type === AuthAction.SignOut) {
    API.signOut()
      .then(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      })
      .catch(() => {
        i18n.on("loaded", () => {
          Toast.error({
            title: i18n.t("Error.logout"),
            buttons: [i18n.t("Error.retry")],
            firstButtonOnClick: () => store.dispatch(Actions.signOut()),
            autoClose: false,
          });
        });
      });
  }
};
*/
