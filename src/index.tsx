import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import "index.scss";
import Parse from "parse";
import {CookieNotice} from "components/CookieNotice";
import store from "store";
import Router from "routes/Router";
import {I18nextProvider} from "react-i18next";
import {ToastContainer} from "react-toastify";
import i18n from "./i18n";

Parse.initialize("Scrumlr");

Parse.serverURL = process.env.REACT_APP_SERVER_API_URL || `/api`;
Parse.liveQueryServerURL = process.env.REACT_APP_LIVEQUERY_URL || `wss://${window.location.hostname}/ws`;

if (localStorage.getItem("theme")) {
  document.documentElement.setAttribute("theme", localStorage.getItem("theme")!);
} else if (!window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.setAttribute("theme", "dark");
} else {
  document.documentElement.setAttribute("theme", "light");
}

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <ToastContainer className="toast-container__container" toastClassName="toast-container__toast" bodyClassName="toast-container__body" limit={2} />
          <Router />
          <CookieNotice />
        </DndProvider>
      </Provider>
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
