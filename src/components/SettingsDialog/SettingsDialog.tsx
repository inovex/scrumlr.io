import React, {useEffect} from "react";
import ReactDOM from "react-dom";
import {Outlet} from "react-router";
import {Link} from "react-router-dom";
import "./SettingsDialog.scss";

export const SettingsDialog: React.VFC = () => {
  useEffect(() => {
    console.log("SettingsDialog");
  });

  return ReactDOM.createPortal(
    <aside className="settings-dialog">
      <nav>
        <Link to="">Board Settings</Link>
        <Link to="participants">Participants</Link>
        <Link to="appearance">Appearance</Link>
        <Link to="share">Share Session</Link>
        <Link to="export">Export Board</Link>
        <Link to="feedback">Feedback</Link>
        <Link to="profile">Change your profile</Link>
      </nav>
      <Outlet />
    </aside>,
    document.body
  );
};
