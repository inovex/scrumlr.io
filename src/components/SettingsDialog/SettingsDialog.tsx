import {useEffect, VFC} from "react";
import {Outlet, useNavigate} from "react-router";
import {Link} from "react-router-dom";
import {useAppSelector} from "store";
import "./SettingsDialog.scss";
import {Portal} from "components/Portal";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import classNames from "classnames";
import Parse from "parse";
import {Avatar} from "components/Avatar";

export const SettingsDialog: VFC = () => {
  const navigate = useNavigate();
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);
  const displayName = useAppSelector((state) => state.users.all.filter((user) => user.id === Parse.User.current()!.id)[0].displayName);

  useEffect(() => {
    // If the window is large enough the show the whole dialog, automatically select the
    // first navigatin item to show
    if (window.location.pathname.endsWith("/settings") && window.innerWidth > 882) {
      navigate("board");
    }
  }, [navigate]);

  return (
    <Portal darkBackground onClose={() => navigate(`/board/${boardId}`)}>
      <aside className="settings-dialog">
        <div className="settings-dialog__sidebar">
          <ScrumlrLogo className="settings-dialog__scrumlr-logo" />
          <nav className="settings-dialog__navigation">
            <Link
              to="board"
              className={classNames("navigation__item", "accent-color__backlog-blue", {"navigation__item--active": window.location.pathname.endsWith("/settings/board")})}
            >
              <p>Board Settings</p>
              <p>Name, Access Policy</p>
              <SettingsIcon className="navigation-item__icon" />
            </Link>
            <Link
              to="participants"
              className={classNames("navigation__item", "accent-color__poker-purple", {"navigation__item--active": window.location.pathname.endsWith("/settings/participants")})}
            >
              <p>Participants</p>
              <p>User List, User Rrole</p>
              <SettingsIcon className="navigation-item__icon" />
            </Link>
            <Link
              to="appearance"
              className={classNames("navigation__item", "accent-color__lean-lilac", {"navigation__item--active": window.location.pathname.endsWith("/appearance")})}
            >
              <p>Appearance</p>
              <p>Notifications, Language, UI</p>
              <SettingsIcon className="navigation-item__icon" />
            </Link>
            <Link to="share" className={classNames("navigation__item", "accent-color__planning-pink", {"navigation__item--active": window.location.pathname.endsWith("/share")})}>
              <p>Share Session</p>
              <p>QR Code, URL</p>
              <SettingsIcon className="navigation-item__icon" />
            </Link>
            <Link to="export" className={classNames("navigation__item", "accent-color__backlog-blue", {"navigation__item--active": window.location.pathname.endsWith("/export")})}>
              <p>Export Board</p>
              <p>Share the board</p>
              <SettingsIcon className="navigation-item__icon" />
            </Link>
            <Link
              to="feedback"
              className={classNames("navigation__item", "accent-color__poker-purple", {"navigation__item--active": window.location.pathname.endsWith("/feedback")})}
            >
              <p>Feedback</p>
              <p>We love to hear from you</p>
              <SettingsIcon className="navigation-item__icon" />
            </Link>
            <Link to="profile" className={classNames("navigation__item", "accent-color__lean-lilac", {"navigation__item--active": window.location.pathname.endsWith("/profile")})}>
              <p>{displayName}</p>
              <p>Edit Profile</p>
              <Avatar seed={Parse.User.current()!.id} className="navigation-item__icon" />
            </Link>
          </nav>
        </div>
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
