import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import "./index.scss";
import {ToastContainer} from "react-toastify";
import Parse from "parse";
import store from "./store";
import Router from "./routes/Router";

Parse.initialize("Scrumlr");
Parse.serverURL = process.env.REACT_APP_SERVER_API_URL || "http://localhost:4000/api";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router />
      <ToastContainer />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
