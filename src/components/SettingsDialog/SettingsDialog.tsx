import React, {useEffect} from "react";
import ReactDOM from "react-dom";
import "./SettingsDialog.scss";

export const SettingsDialog: React.VFC = () => {
  useEffect(() => {
    console.log("SettingsDialog");
  });

  return ReactDOM.createPortal(<aside className="settings-dialog">Hello World</aside>, document.body);
};
