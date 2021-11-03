import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import "index.scss";
import {ToastContainer} from "react-toastify";
import Parse from "parse";
import {CookieNotice} from "components/CookieNotice";
import store from "store";
import Router from "routes/Router";

Parse.initialize("Scrumlr");
Parse.serverURL = process.env.REACT_APP_SERVER_API_URL || `${window.location.protocol}//${window.location.hostname}/api`;
Parse.liveQueryServerURL = process.env.REACT_APP_LIVEQUERY_URL || `wss://${window.location.hostname}/ws`;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <Router />
        <ToastContainer className="toast-container__container" toastClassName="toast-container__toast" bodyClassName="toast-container__body" limit={2} />
        <CookieNotice />
      </DndProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
