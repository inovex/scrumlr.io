import React from "react";
import {Outlet, useNavigate} from "react-router";
import {Link} from "react-router-dom";
import {useAppSelector} from "store";
import "./SettingsDialog.scss";
import {Portal} from "components/Portal";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";

export const SettingsDialog: React.VFC = () => {
  const navigate = useNavigate();
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);

  return (
    <Portal darkBackground onClose={() => navigate(`/board/${boardId}`)}>
      <aside className="settings-dialog">
        <nav className="settings-dialog__navigation">
          <Link to="" className="navigation__item">
            <p>Board Settings</p>
            <p>Name, Access Policy</p>
            <SettingsIcon className="navigation-item__icon" />
          </Link>
          <Link to="participants" className="navigation__item">
            <p>Participants</p>
            <p>User List, User Rrole</p>
            <SettingsIcon className="navigation-item__icon" />
          </Link>
          <Link to="appearance" className="navigation__item">
            <p>Appearance</p>
            <p>Notifications, Language, UI</p>
            <SettingsIcon className="navigation-item__icon" />
          </Link>
          <Link to="share" className="navigation__item">
            <p>Share Session</p>
            <p>QR Code, URL</p>
            <SettingsIcon className="navigation-item__icon" />
          </Link>
          <Link to="export" className="navigation__item">
            <p>Export Board</p>
            <p>Share the board</p>
            <SettingsIcon className="navigation-item__icon" />
          </Link>
          <Link to="feedback" className="navigation__item">
            <p>Feedback</p>
            <p>We love to hear from you</p>
            <SettingsIcon className="navigation-item__icon" />
          </Link>
          <Link to="profile" className="navigation__item">
            <p>TODO Displayname</p>
            <p>Edit Profile</p>
            <SettingsIcon className="navigation-item__icon" />
          </Link>
        </nav>
        <article className="settings-dialog__content">
          <Outlet />
        </article>
        <Link to={`/board/${boardId}`} className="settings-dialog__close-button">
          <CloseIcon className="close-button__icon" />
        </Link>
      </aside>
    </Portal>
  );
};
