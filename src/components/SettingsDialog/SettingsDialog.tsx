import {useEffect, useState} from "react";
import {animated, Transition} from "@react-spring/web";
import {Outlet, useLocation, useNavigate, Link} from "react-router";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Avatar} from "components/Avatar";
import {Portal} from "components/Portal";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {useAppSelector} from "store";
import {dialogTransitionConfig} from "utils/transitionConfig";
import {ArrowLeft, Close} from "components/Icon";
import {MENU_ENTRIES, MenuEntry, MenuItemConfig, MenuItemKey, MOBILE_BREAKPOINT} from "constants/settings";
import {getColorClassName} from "constants/colors";
import "./SettingsDialog.scss";

type SettingsDialogProps = {
  enabledMenuItems: Partial<Record<MenuItemKey, boolean>>;
};

export const SettingsDialog = (props: SettingsDialogProps) => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const me = useAppSelector((applicationState) => applicationState.participants?.self?.user)!;
  const isBoardModerator = useAppSelector((state) => state.participants?.self?.role === "MODERATOR" || state.participants?.self?.role === "OWNER");

  const [activeMenuItem, setActiveMenuItem] = useState<MenuItemConfig>();

  const transitionConfigMobile = {
    from: {},
    enter: {},
    items: true,
  };

  useEffect(() => {
    const pathEnd = location.pathname.split("/").at(-1)!;

    // search all menu items for the one where the location matches the current path; then return that entry
    const activeMenuEntry = MENU_ENTRIES.find((entry) => entry.value.location === pathEnd);
    setActiveMenuItem(activeMenuEntry?.value);

    /* check if a user is allowed to go to a menu entry.
     * the conditions for this are:
     * 1. the menu item is enabled
     * 2. if user is moderator, any entry is allowed (P)
     * 3. for non-moderators, only non-moderator-only entries are allowed (!P && !Q)
     * P || (!P && !Q) simplifies to P || !Q
     */
    const isMenuEntryAllowed = (menuEntry: MenuEntry) => props.enabledMenuItems[menuEntry.key] && (isBoardModerator || !menuEntry.value.isModeratorOnly);

    /* finds the first allowed menu item a user can go to and navigates there.
     * if no route is allowed, the user is navigated back to the page below settings. */
    const goToFirstAllowedMenuEntry = () => {
      const firstAllowedMenuEntry = MENU_ENTRIES.find(isMenuEntryAllowed);
      navigate(firstAllowedMenuEntry?.value.location ?? "..");
    };

    /**
     * settings logic:
     * if a menu entry is entered (like /settings/board),
     * check if the user is allowed to go there.
     * if yes, that's fine, if not, navigate to the first allowed entry.
     *
     * if no sub route is entered, so /settings/ standalone,
     * the first allowed menu entry is set to active.
     * however, for mobile devices, we stay on /settings/ instead of going to a sub route.
     * */

    // sub route active, like /settings/board/
    if (activeMenuEntry) {
      if (!isMenuEntryAllowed(activeMenuEntry)) {
        goToFirstAllowedMenuEntry();
      }
      // do nothing if sub route and allowed to enter
    }
    // no sub menu, i.e. /settings/
    // not mobile
    else if (window.innerWidth >= MOBILE_BREAKPOINT) {
      goToFirstAllowedMenuEntry();
    }
    // else, do nothing if no submenu and mobile
  }, [navigate, isBoardModerator, activeMenuItem, props.enabledMenuItems, location.pathname]);

  /* renders a menu item.
   * condition: menu item is enabled and user has authorization
   * special case: profile, where avatar is used instead of an icon and name instead of localization title */
  const renderMenuItem = (menuEntry: MenuEntry) => {
    if (!props.enabledMenuItems[menuEntry.key]) {
      return null;
    }

    if (menuEntry.value.isModeratorOnly && !isBoardModerator) {
      return null;
    }

    const Icon = menuEntry.value.icon;

    return (
      <Link
        to={menuEntry.value.location}
        className={classNames("navigation__item", {"navigation__item--active": menuEntry.value.location === activeMenuItem?.location}, getColorClassName(menuEntry.value.color))}
      >
        {Icon === "profile" ? <Avatar seed={me?.id} avatar={me?.avatar} className="navigation-item__icon" /> : <Icon className="navigation-item__icon" />}
        <div className="navigation-item__content">
          <p className="navigation-item__name">{menuEntry.value.localizationKey === "Profile" ? me?.name : t(`SettingsDialog.${menuEntry.value.localizationKey}`)}</p>
          <p className="navigation-item__description">{t(`SettingsDialog.${menuEntry.value.localizationKey}Description`)}</p>
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
                <nav className="settings-dialog__navigation">{MENU_ENTRIES.map((menuEntry) => renderMenuItem(menuEntry))}</nav>
              </div>
              <article className="settings-dialog__content">
                <Link to="" className="settings-dialog__back-link">
                  <ArrowLeft />
                </Link>
                <Outlet context={activeMenuItem} />
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
