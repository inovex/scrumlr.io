import {useEffect, VFC} from "react";
import {Outlet, useNavigate} from "react-router";
import {Link} from "react-router-dom";
import classNames from "classnames";
import Parse from "parse";
import {useTranslation} from "react-i18next";

import {Avatar} from "components/Avatar";
import {Portal} from "components/Portal";

import {useAppSelector} from "store";

import {ReactComponent as ScrumlrLogo} from "assets/scrumlr-logo-light.svg";
import ScrumlrLogoDark from "assets/scrumlr-logo-dark.png";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as PreviousArrow} from "assets/icon-arrow-previous.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import {ReactComponent as ParticipantsIcon} from "assets/icon-participants.svg";
import {ReactComponent as AppearanceIcon} from "assets/icon-appearance.svg";
import {ReactComponent as ExportIcon} from "assets/icon-export.svg";
import {ReactComponent as FeedbackIcon} from "assets/icon-feedback.svg";

import "./SettingsDialog.scss";

export const SettingsDialog: VFC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);
  const displayName = useAppSelector((applicationState) => {
    if (applicationState.users.all.length !== 0) {
      return applicationState.users.all.find((user) => user.id === Parse.User.current()?.id)?.displayName;
    }
    return undefined;
  });

  useEffect(() => {
    // If the window is large enough the show the whole dialog, automatically select the
    // first navigatin item to show
    if (window.location.pathname.endsWith("/settings") && window.innerWidth > 920) {
      navigate("board");
    }
  }, [navigate]);

  return (
    <Portal onClose={() => navigate(`/board/${boardId}`)}>
      <aside className={classNames("settings-dialog", {"settings-dialog--selected": !window.location.pathname.endsWith("/settings")})}>
        <div className="settings-dialog__sidebar">
          <ScrumlrLogo className="settings-dialog__scrumlr-logo settings-dialog__scrumlr-logo--light" />
          <img src={ScrumlrLogoDark} alt="Scrumlr Logo" className="settings-dialog__scrumlr-logo settings-dialog__scrumlr-logo--dark" />
          <nav className="settings-dialog__navigation">
            <Link
              to="board"
              className={classNames("navigation__item", "accent-color__backlog-blue", {"navigation__item--active": window.location.pathname.endsWith("/settings/board")})}
            >
              <p>{t("SettingsDialog.BoardSettings")}</p>
              <p>{t("SettingsDialog.BoardSettingsDescription")}</p>
              <SettingsIcon className="navigation-item__icon" />
            </Link>
            <Link
              to="participants"
              className={classNames("navigation__item", "accent-color__poker-purple", {"navigation__item--active": window.location.pathname.endsWith("/settings/participants")})}
            >
              <p>{t("SettingsDialog.Participants")}</p>
              <p>{t("SettingsDialog.ParticipantsDescription")}</p>
              <ParticipantsIcon className="navigation-item__icon" />
            </Link>
            <Link
              to="appearance"
              className={classNames("navigation__item", "accent-color__lean-lilac", {"navigation__item--active": window.location.pathname.endsWith("/appearance")})}
            >
              <p>{t("SettingsDialog.Appearance")}</p>
              <p>{t("SettingsDialog.AppearanceDescription")}</p>
              <AppearanceIcon className="navigation-item__icon" />
            </Link>
            <Link to="share" className={classNames("navigation__item", "accent-color__planning-pink", {"navigation__item--active": window.location.pathname.endsWith("/share")})}>
              <p>{t("SettingsDialog.ShareSession")}</p>
              <p>{t("SettingsDialog.ShareSessionDescription")}</p>
              <ShareIcon className="navigation-item__icon" />
            </Link>
            <Link to="export" className={classNames("navigation__item", "accent-color__backlog-blue", {"navigation__item--active": window.location.pathname.endsWith("/export")})}>
              <p>{t("SettingsDialog.ExportBoard")}</p>
              <p>{t("SettingsDialog.ExportBoardDescription")}</p>
              <ExportIcon className="navigation-item__icon" />
            </Link>
            <Link
              to="feedback"
              className={classNames("navigation__item", "accent-color__poker-purple", {"navigation__item--active": window.location.pathname.endsWith("/feedback")})}
            >
              <p>{t("SettingsDialog.Feedback")}</p>
              <p>{t("SettingsDialog.FeedbackDescription")}</p>
              <FeedbackIcon className="navigation-item__icon" />
            </Link>
            {displayName && (
              <Link
                to="profile"
                className={classNames("navigation__item", "accent-color__lean-lilac", {"navigation__item--active": window.location.pathname.endsWith("/profile")})}
              >
                <p>{displayName}</p>
                <p>{t("SettingsDialog.ProfileDescription")}</p>
                <Avatar seed={Parse.User.current()!.id} className="navigation-item__icon" />
              </Link>
            )}
          </nav>
        </div>
        <article className="settings-dialog__content">
          <Link to="" className="settings-dialog__back-link">
            <PreviousArrow />
          </Link>
          <Outlet />
        </article>
        <Link to={`/board/${boardId}`} className="settings-dialog__close-button">
          <CloseIcon className="close-button__icon" />
        </Link>
      </aside>
    </Portal>
  );
};
