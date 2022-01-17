import React from "react";
import {Outlet} from "react-router";
import {Link} from "react-router-dom";
import {useAppSelector} from "store";
import "./SettingsDialog.scss";
import {Portal} from "components/Portal";

export const SettingsDialog: React.VFC = () => {
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);

  return (
    <Portal darkBackground onClose={() => undefined}>
      <aside className="settings-dialog">
        <nav className="settings-dialog__navigation">
          <Link to="">
            <div className="navigation__item">Board Settings</div>
          </Link>
          <Link to="participants">
            <div className="navigation__item">Participants</div>
          </Link>
          <Link to="appearance">
            <div className="navigation__item">Appearance</div>
          </Link>
          <Link to="share">
            <div className="navigation__item">Share Session</div>
          </Link>
          <Link to="export">
            <div className="navigation__item">Export Board</div>
          </Link>
          <Link to="feedback">
            <div className="navigation__item">Feedback</div>
          </Link>
          <Link to="profile">
            <div className="navigation__item">Change your profile</div>
          </Link>
        </nav>
        <article className="settings-dialog__content">
          <Outlet />
        </article>
        <Link to={`/board/${boardId}`} className="settings-dialog__close-button">
          X
        </Link>
      </aside>
    </Portal>
  );
};
