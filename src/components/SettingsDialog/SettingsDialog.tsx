import {useEffect, useState} from "react";
import {animated, Transition} from "@react-spring/web";
import {Outlet, useLocation, useNavigate} from "react-router";
import {Link} from "react-router-dom";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Avatar} from "components/Avatar";
import {Portal} from "components/Portal";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {useAppSelector} from "store";
import {dialogTransitionConfig} from "utils/transitionConfig";
import {ArrowLeft, Close} from "components/Icon";
import {MENU_ITEMS, MenuItem, MenuKey, MOBILE_BREAKPOINT} from "constants/settings";
import {getColorClassName} from "constants/colors";
import "./SettingsDialog.scss";

type SettingsDialogProps = {
  enabledMenuItems: Partial<Record<MenuKey, boolean>>;
};

export const SettingsDialog = (props: SettingsDialogProps) => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const me = useAppSelector((applicationState) => applicationState.participants?.self.user);
  const isBoardModerator = useAppSelector((state) => state.participants?.self.role === "MODERATOR" || state.participants?.self.role === "OWNER");

  const [activeMenuKey, setActiveMenuKey] = useState<MenuKey | "settings">();

  const transitionConfigMobile = {
    from: {},
    enter: {},
    items: true,
  };

  useEffect(() => {
    const pathEnd = location.pathname.split("/").at(-1);

    // search all menu items for the one where the location matches the current path. then return the key of the (key, value) tuple
    const active = (Object.entries(MENU_ITEMS).find(([_, item]) => item.location === pathEnd)?.[0] ?? "settings") as MenuKey;
    setActiveMenuKey(active);
  }, [isBoardModerator, location, navigate]);

  useEffect(() => {
    /* finds the first valid menu item a user can go to.
     * the conditions for this are:
     * 1. the menu item is enabled
     * 2. if user is moderator, choose one that is moderator only
     * 3. if user isn't moderator, choose one that isn't moderator only
     * 2. and 3.: (P & Q) | (!P & !Q) simplifies to P <=> Q */
    const findFirstValidMenuItem = () =>
      Object.entries(MENU_ITEMS).find(([key, menuItem]) => props.enabledMenuItems[key as MenuKey] && menuItem.isModeratorOnly === isBoardModerator)?.[1];

    // If the window is large enough the show the whole dialog, automatically select the first navigation item to show.
    // if none is found, go back
    if (activeMenuKey === "settings" && window.innerWidth >= MOBILE_BREAKPOINT) {
      const section = findFirstValidMenuItem();
      navigate(section?.location ?? "..");
    }
    // If user is not a moderator of the section, they shouldn't see it
    if (activeMenuKey && activeMenuKey !== "settings" && MENU_ITEMS[activeMenuKey].isModeratorOnly && !isBoardModerator) {
      navigate("..");
    }
  }, [navigate, isBoardModerator, activeMenuKey, props.enabledMenuItems]);

  /* renders a menu item.
   * condition: menu item is enabled and user has authorization
   * special case: profile, where avatar is used instead of an icon and name instead of localization title */
  const renderMenuItem = (itemKey: MenuKey, menuItem: MenuItem) => {
    if (!props.enabledMenuItems[itemKey]) {
      return null;
    }

    if (menuItem.isModeratorOnly && !isBoardModerator) {
      return null;
    }

    const Icon = menuItem.icon;

    return (
      <Link to={menuItem.location} className={classNames("navigation__item", {"navigation__item--active": menuItem.location === activeMenuKey}, getColorClassName(menuItem.color))}>
        {Icon === "profile" ? <Avatar seed={me?.id} avatar={me?.avatar} className="navigation-item__icon" /> : <Icon className="navigation-item__icon" />}
        <div className="navigation-item__content">
          <p className="navigation-item__name">{menuItem.localizationKey === "Profile" ? me?.name : t(`SettingsDialog.${menuItem.localizationKey}`)}</p>
          <p className="navigation-item__description">{t(`SettingsDialog.${menuItem.localizationKey}Description`)}</p>
        </div>
      </Link>
    );
  };

  return (
    <Portal onClose={() => navigate(`..`)}>
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
                <ScrumlrLogo className="settings-dialog__scrumlr-logo" />
                {/* render all menu items */}
                <nav className="settings-dialog__navigation">{Object.entries(MENU_ITEMS).map(([key, value]) => renderMenuItem(key as MenuKey, value))}</nav>
              </div>
              <article className="settings-dialog__content">
                <Link to="" className="settings-dialog__back-link">
                  <ArrowLeft />
                </Link>
                <Outlet />
              </article>
              <Link to=".." className="settings-dialog__close-button">
                <Close className="close-button__icon" />
              </Link>
            </animated.aside>
          )}
        </Transition>
      </div>
    </Portal>
  );
};
