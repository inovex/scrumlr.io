import {useEffect, FC} from "react";
import {animated, Transition} from "react-spring";
import {Outlet, useNavigate} from "react-router";
import {Link} from "react-router-dom";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Avatar} from "components/Avatar";
import {Portal} from "components/Portal";
import {useAppSelector} from "store";
import {dialogTransitionConfig} from "utils/transitionConfig";
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

export const SettingsDialog: FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);
  const me = useAppSelector((applicationState) => applicationState.participants?.self.user);
  const isBoardModerator = useAppSelector((state) => state.participants?.self.role === "MODERATOR" || state.participants?.self.role === "OWNER");
  const feedbackEnabled = useAppSelector((state) => state.view.feedbackEnabled);
  const isOnboarding = window.location.pathname.startsWith("/onboarding");

  const transitionConfigMobile = {
    from: {},
    enter: {},
    items: true,
  };

  useEffect(() => {
    // If user is not a moderator of the board, he shouldn't see the board settings
    if (!isBoardModerator && window.location.pathname.endsWith("/settings/board")) {
      if (!isOnboarding) {
        navigate(`/board/${boardId}/settings/participants`);
      } else {
        navigate(`/onboarding-board/${boardId}/settings/participants`);
      }
    }
    // If the window is large enough the show the whole dialog, automatically select the
    // first navigation item to show
    if (window.location.pathname.endsWith("/settings") && window.innerWidth > 920) {
      navigate(isBoardModerator ? "board" : "participants");
    }
  }, [navigate, me, boardId, isBoardModerator, isOnboarding]);

  return (
    <Portal onClose={() => !isOnboarding ? navigate(`/board/${boardId}`) : navigate(`/onboarding-board/${boardId}`)}>
      <div className="settings-dialog__background" />
      <div className="settings-dialog__wrapper">
        <Transition {...(window.screen.width >= 450 ? dialogTransitionConfig : transitionConfigMobile)}>
          {(styles) => (
            <animated.aside
              aria-label={t("settings-dialog.title")}
              aria-modal="true"
              className={classNames("settings-dialog", {"settings-dialog--selected": !window.location.pathname.endsWith("/settings")})}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              style={styles}
            >
              <div className="settings-dialog__sidebar">
                <ScrumlrLogo className="settings-dialog__scrumlr-logo settings-dialog__scrumlr-logo--light" />
                <img src={ScrumlrLogoDark} alt="Scrumlr Logo" className="settings-dialog__scrumlr-logo settings-dialog__scrumlr-logo--dark" />
                <nav className="settings-dialog__navigation">
                  {isBoardModerator && (
                    <Link
                      to="board"
                      className={classNames("navigation__item", "accent-color__backlog-blue", {"navigation__item--active": window.location.pathname.endsWith("/settings/board")})}
                    >
                      <SettingsIcon className="navigation-item__icon" />
                      <div className="navigation-item__content">
                        <p className="navigation-item__name">{t("SettingsDialog.BoardSettings")}</p>
                        <p className="navigation-item__description">{t("SettingsDialog.BoardSettingsDescription")}</p>
                      </div>
                    </Link>
                  )}
                  <Link
                    to="participants"
                    className={classNames("navigation__item", "accent-color__poker-purple", {
                      "navigation__item--active": window.location.pathname.endsWith("/settings/participants"),
                    })}
                  >
                    <ParticipantsIcon className="navigation-item__icon" />
                    <div className="navigation-item__content">
                      <p className="navigation-item__name">{t("SettingsDialog.Participants")}</p>
                      <p className="navigation-item__description">{t("SettingsDialog.ParticipantsDescription")}</p>
                    </div>
                  </Link>
                  <Link
                    to="appearance"
                    className={classNames("navigation__item", "accent-color__lean-lilac", {"navigation__item--active": window.location.pathname.endsWith("/appearance")})}
                  >
                    <AppearanceIcon className="navigation-item__icon" />
                    <div className="navigation-item__content">
                      <p className="navigation-item__name">{t("SettingsDialog.Appearance")}</p>
                      <p className="navigation-item__description">{t("SettingsDialog.AppearanceDescription")}</p>
                    </div>
                  </Link>
                  <Link
                    to="share"
                    className={classNames("navigation__item", "accent-color__planning-pink", {"navigation__item--active": window.location.pathname.endsWith("/share")})}
                  >
                    <ShareIcon className="navigation-item__icon" />
                    <div className="navigation-item__content">
                      <p className="navigation-item__name">{t("SettingsDialog.ShareSession")}</p>
                      <p className="navigation-item__description">{t("SettingsDialog.ShareSessionDescription")}</p>
                    </div>
                  </Link>
                  <Link
                    to="export"
                    className={classNames("navigation__item", "accent-color__backlog-blue", {"navigation__item--active": window.location.pathname.endsWith("/export")})}
                  >
                    <ExportIcon className="navigation-item__icon" />
                    <div className="navigation-item__content">
                      <p className="navigation-item__name">{t("SettingsDialog.ExportBoard")}</p>
                      <p className="navigation-item__description">{t("SettingsDialog.ExportBoardDescription")}</p>
                    </div>
                  </Link>
                  {feedbackEnabled && (
                    <Link
                      to="feedback"
                      className={classNames("navigation__item", "accent-color__poker-purple", {"navigation__item--active": window.location.pathname.endsWith("/feedback")})}
                    >
                      <FeedbackIcon className="navigation-item__icon" />
                      <div className="navigation-item__content">
                        <p className="navigation-item__name">{t("SettingsDialog.Feedback")}</p>
                        <p className="navigation-item__description">{t("SettingsDialog.FeedbackDescription")}</p>
                      </div>
                    </Link>
                  )}
                  {me && (
                    <Link
                      to="profile"
                      className={classNames("navigation__item", "accent-color__lean-lilac", {"navigation__item--active": window.location.pathname.endsWith("/profile")})}
                    >
                      <Avatar seed={me.id} avatar={me.avatar} className="navigation-item__icon" />
                      <div className="navigation-item__content">
                        <p className="navigation-item__name">{me.name}</p>
                        <p className="navigation-item__description">{t("SettingsDialog.ProfileDescription")}</p>
                      </div>
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
              <Link to={!isOnboarding? `/board/${boardId}` : `/onboarding-board/${boardId}`} className="settings-dialog__close-button">
                <CloseIcon className="close-button__icon" />
              </Link>
            </animated.aside>
          )}
        </Transition>
      </div>
    </Portal>
  );
};
