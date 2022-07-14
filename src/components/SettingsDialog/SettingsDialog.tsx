import {useEffect, VFC} from "react";
import {Outlet, useNavigate} from "react-router";
import {Link} from "react-router-dom";
import classNames from "classnames";
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
  const me = useAppSelector((applicationState) => applicationState.participants?.self.user);
  const isBoardModerator = useAppSelector((state) => state.participants?.self.role === "MODERATOR" || state.participants?.self.role === "OWNER");
  const feedbackEnabled = useAppSelector((state) => state.view.feedbackEnabled);

  useEffect(() => {
    // If user is not a moderator of the board, he shouldn't see the board settings
    if (!isBoardModerator && window.location.pathname.endsWith("/settings/board")) {
      navigate(`/board/${boardId}/settings/participants`);
    }
    // If the window is large enough the show the whole dialog, automatically select the
    // first navigation item to show
    if (window.location.pathname.endsWith("/settings") && window.innerWidth > 920) {
      navigate(isBoardModerator ? "board" : "participants");
    }
  }, [navigate, me, boardId, isBoardModerator]);

  return (
    <Portal onClose={() => navigate(`/board/${boardId}`)} className="settings-dialog__portal">
      <aside className={classNames("settings-dialog", {"settings-dialog--selected": !window.location.pathname.endsWith("/settings")})}>
        <div className="settings-dialog__sidebar">
          <ScrumlrLogo className="settings-dialog__scrumlr-logo settings-dialog__scrumlr-logo--light" />
          <img src={ScrumlrLogoDark} alt="Scrumlr Logo" className="settings-dialog__scrumlr-logo settings-dialog__scrumlr-logo--dark" />
          <nav className="settings-dialog__navigation">
            {isBoardModerator && (
              <Link
                to="board"
                className={classNames("navigation__item", "accent-color__backlog-blue", {"navigation__item--active": window.location.pathname.endsWith("/settings/board")})}
              >
                <p>{t("SettingsDialog.BoardSettings")}</p>
                <p>{t("SettingsDialog.BoardSettingsDescription")}</p>
                <SettingsIcon className="navigation-item__icon" />
              </Link>
            )}
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
            {feedbackEnabled && (
              <Link
                to="feedback"
                className={classNames("navigation__item", "accent-color__poker-purple", {"navigation__item--active": window.location.pathname.endsWith("/feedback")})}
              >
                <p>{t("SettingsDialog.Feedback")}</p>
                <p>{t("SettingsDialog.FeedbackDescription")}</p>
                <FeedbackIcon className="navigation-item__icon" />
              </Link>
            )}
            {me && (
              <Link
                to="profile"
                className={classNames("navigation__item", "accent-color__lean-lilac", {"navigation__item--active": window.location.pathname.endsWith("/profile")})}
              >
                <p className="navigation-item__user-name">{me.name}</p>
                <p>{t("SettingsDialog.ProfileDescription")}</p>
                <Avatar seed={me.id} avatar={me.avatar} className="navigation-item__icon" />
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
