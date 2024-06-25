import {useEffect, useState} from "react";
import {animated, Transition} from "@react-spring/web";
import {Outlet, useLocation, useNavigate} from "react-router";
import {Link} from "react-router-dom";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Avatar} from "components/Avatar";
import {Portal} from "components/Portal";
import {useAppSelector} from "store";
import {dialogTransitionConfig} from "utils/transitionConfig";
import {ReactComponent as ScrumlrLogo} from "assets/scrumlr-logo-light.svg";
import ScrumlrLogoDark from "assets/scrumlr-logo-dark.png";
import {ArrowLeft, Close} from "components/Icon";
import {MENU_ITEMS, MenuItem, MenuKey} from "constants/settings";
import {getColorClassName} from "../../constants/colors";
import "./SettingsDialog.scss";

type SettingsDialogProps = {
  enabledMenuItems: Partial<Record<MenuKey, boolean>>;
};

export const SettingsDialog = (props: SettingsDialogProps) => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);
  const me = useAppSelector((applicationState) => applicationState.participants?.self.user);
  const isBoardModerator = useAppSelector((state) => state.participants?.self.role === "MODERATOR" || state.participants?.self.role === "OWNER");

  const [activeMenuItem, setActiveMenuItem] = useState("");

  const transitionConfigMobile = {
    from: {},
    enter: {},
    items: true,
  };

  useEffect(() => {
    const pathEnd = location.pathname.split("/").at(-1)!;
    setActiveMenuItem(pathEnd);
  }, [location]);

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

  /* renders a menu item.
   * special case: profile, where avatar is used instead of an icon
   * and name instead of localization title */
  const renderMenuItem = (itemKey: MenuKey, menuItem: MenuItem) => {
    if (!props.enabledMenuItems[itemKey]) {
      return null;
    }

    if (menuItem.isModeratorOnly && !isBoardModerator) {
      return null;
    }

    const Icon = menuItem.icon;

    return (
      <Link
        to={menuItem.location}
        className={classNames("navigation__item", {"navigation__item--active": menuItem.location === activeMenuItem}, getColorClassName(menuItem.color))}
      >
        {Icon === "profile" ? <Avatar seed={me?.id} avatar={me?.avatar} className="navigation-item__icon" /> : <Icon className="navigation-item__icon" />}
        <div className="navigation-item__content">
          <p className="navigation-item__name">{menuItem.localizationKey === "Profile" ? me?.name : t(`SettingsDialog.${menuItem.localizationKey}`)}</p>
          <p className="navigation-item__description">{t(`SettingsDialog.${menuItem.localizationKey}Description`)}</p>
        </div>
      </Link>
    );
  };

  return (
    <Portal onClose={() => navigate(`/board/${boardId}`)}>
      <div className="settings-dialog__background" />
      <div className="settings-dialog__wrapper">
        <Transition {...(window.screen.width >= 450 ? dialogTransitionConfig : transitionConfigMobile)}>
          {(styles) => (
            <animated.aside
              aria-modal="true"
              className={classNames("settings-dialog", {"settings-dialog--selected": !window.location.pathname.endsWith("/settings")})}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              style={styles}
            >
              <div className="settings-dialog__sidebar">
                <ScrumlrLogo className="settings-dialog__scrumlr-logo settings-dialog__scrumlr-logo--light" />
                <img src={ScrumlrLogoDark} alt="Scrumlr Logo" className="settings-dialog__scrumlr-logo settings-dialog__scrumlr-logo--dark" />
                {/* render all menu items */}
                <nav className="settings-dialog__navigation">{Object.entries(MENU_ITEMS).map(([key, value]) => renderMenuItem(key as MenuKey, value))}</nav>
              </div>
              <article className="settings-dialog__content">
                <Link to="" className="settings-dialog__back-link">
                  <ArrowLeft />
                </Link>
                <Outlet />
              </article>
              <Link to={`/board/${boardId}`} className="settings-dialog__close-button">
                <Close className="close-button__icon" />
              </Link>
            </animated.aside>
          )}
        </Transition>
      </div>
    </Portal>
  );
};
