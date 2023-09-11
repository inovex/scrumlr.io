import React, {Suspense} from "react";
import {createRoot} from "react-dom/client";
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
import {register} from "serviceWorkerRegistration";
import Plausible from "plausible-tracker";
import {SHOW_LEGAL_DOCUMENTS, ANALYTICS_DATA_DOMAIN, ANALYTICS_SRC} from "./config";
import "react-tooltip/dist/react-tooltip.css";

const APP_VERSION = process.env.REACT_APP_VERSION;
if (APP_VERSION) {
  saveToStorage(APP_VERSION_STORAGE_KEY, APP_VERSION);
}

if (ANALYTICS_DATA_DOMAIN && ANALYTICS_SRC) {
  const {trackPageview} = Plausible({
    domain: ANALYTICS_DATA_DOMAIN,
    apiHost: ANALYTICS_SRC,
  });
  const handleAnalytics = async () => {
    if (window.location.href.includes("/board/")) {
      const [baseUrl, boardId] = window.location.href.split("/board/");
      const hash = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(boardId));
      const url = `${baseUrl}/${Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;
      trackPageview({
        url,
      });
    } else {
      trackPageview();
    }
  };
  handleAnalytics();
}

const root = createRoot(document.getElementById("root") as HTMLDivElement);

root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <Html />
        <Suspense fallback={<LoadingScreen />}>
          <ToastContainer limit={2} />
          <Router />
          {SHOW_LEGAL_DOCUMENTS && <CookieNotice />}
        </Suspense>
      </Provider>
    </I18nextProvider>
  </React.StrictMode>
);
store.dispatch(Actions.initApplication());

register();
