import React, {Suspense} from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import "index.scss";
import {CookieNotice} from "components/CookieNotice";
import store from "store";
import Router from "routes/Router";
import {I18nextProvider} from "react-i18next";
import {ToastContainer} from "react-toastify";
import i18n from "i18n";
import {LoadingScreen} from "components/LoadingScreen";
import {Actions} from "store/action";
import {Html} from "components/Html";
import {APP_VERSION_STORAGE_KEY} from "constants/storage";
import {saveToStorage} from "utils/storage";
import {SHOW_LEGAL_DOCUMENTS} from "./config";

const APP_VERSION = process.env.REACT_APP_VERSION;
if (APP_VERSION) {
  saveToStorage(APP_VERSION_STORAGE_KEY, APP_VERSION);
}

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <Html />
        <Suspense fallback={<LoadingScreen />}>
          <ToastContainer className="toast-container__container" toastClassName="toast-container__toast" bodyClassName="toast-container__body" limit={2} />
          <Router />
          {SHOW_LEGAL_DOCUMENTS && <CookieNotice />}
        </Suspense>
      </Provider>
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

store.dispatch(Actions.initApplication());
