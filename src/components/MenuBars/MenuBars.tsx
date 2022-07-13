import React, {useState} from "react";
import {useNavigate} from "react-router";
import {Actions} from "store/action";
import {useAppSelector} from "store";
import _ from "underscore";
import classNames from "classnames";
import {MenuToggle, MenuButton} from "components/MenuBars/MenuItem";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import {ReactComponent as RaiseHand} from "assets/icon-hand.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {ReactComponent as FocusIcon} from "assets/icon-focus.svg";
import {ReactComponent as ToggleSettingsMenuIcon} from "assets/icon-toggle-settings-menu.svg";
import {ReactComponent as ToggleAddMenuIcon} from "assets/icon-toggle-add-menu.svg";
import {TabIndex} from "constants/tabIndex";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./MenuBars.scss";
import {useHotkeys} from "react-hotkeys-hook";
import {hotkeyMap} from "constants/hotkeys";
import {Toast} from "../../utils/Toast";

export const MenuBars = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    TOGGLE_MODERATION,
    TOGGLE_RAISED_HAND,
    TOGGLE_READY_STATE,
    SHOW_TIMER_MENU,
    SHOW_VOTING_MENU,
    SHOW_SETTINGS,
    TOGGLE_HOTKEYS,
    TOGGLE_SHOW_AUTHORS,
    TOGGLE_SHOW_OTHER_USERS_NOTES,
    TOGGLE_COLUMN_VISIBILITY,
  } = hotkeyMap;

  const [hotkeysEnabled, setHotkeysEnabled] = useState(true);
  const [showAdminMenu, toggleMenus] = useState(false);
  const [animate, setAnimate] = useState(false);

  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self,
      moderation: rootState.view.moderating,
      showAuthors: rootState.board.data?.showAuthors,
      showNotesOfOtherUsers: rootState.board.data?.showNotesOfOtherUsers,
      showHiddenColumns: rootState.participants!.self.showHiddenColumns,
    }),
    _.isEqual
  );

  const isAdmin = state.currentUser.role === "OWNER" || state.currentUser.role === "MODERATOR";
  const isReady = state.currentUser.ready;
  const {raisedHand} = state.currentUser;

  const toggleModeration = () => {
    dispatch(Actions.setModerating(!state.moderation));
  };

  const toggleReadyState = () => {
    dispatch(Actions.setUserReadyStatus(state.currentUser.user.id, !isReady));
  };

  const handleAnimate = (event: React.TransitionEvent<HTMLElement>) => {
    if (event.currentTarget.attributes.getNamedItem("class")?.nodeValue?.includes("menu-animation")) {
      setAnimate(false);
    }
  };

  const toggleRaiseHand = () => {
    dispatch(Actions.setRaisedHand(state.currentUser.user.id, !raisedHand));
  };

  const showTimerMenu = () => navigate("timer");
  const showVotingMenu = () => navigate("voting");
  const showSettings = () => navigate("settings");

  const toggleAdminMenu = () => {
    setAnimate(true);
    toggleMenus((prevState) => !prevState);
  };
  const toggleHotkeys = () => {
    if (hotkeysEnabled) {
      Toast.info(t("Hotkeys.hotkeysDisabled"), 1500);
    } else {
      Toast.info(t("Hotkeys.hotkeysEnabled"), 1500);
    }
    setHotkeysEnabled(!hotkeysEnabled);
  };

  const hotkeyOptions = {
    enabled: hotkeysEnabled,
  };
  const hotkeyOptionsAdmin = {
    enabled: hotkeysEnabled && isAdmin,
  };

  useHotkeys(TOGGLE_HOTKEYS, toggleHotkeys, [hotkeysEnabled]);
  useHotkeys(TOGGLE_MODERATION, toggleModeration, hotkeyOptions, [state.moderation]);
  useHotkeys(TOGGLE_READY_STATE, toggleReadyState, hotkeyOptions, [isReady]);
  useHotkeys(TOGGLE_RAISED_HAND, toggleRaiseHand, hotkeyOptions, [raisedHand]);
  useHotkeys(
    SHOW_TIMER_MENU,
    () => {
      if (!showAdminMenu) {
        toggleAdminMenu();
      }
      showTimerMenu();
    },
    hotkeyOptionsAdmin,
    [showAdminMenu]
  );
  useHotkeys(
    SHOW_VOTING_MENU,
    () => {
      if (!showAdminMenu) {
        toggleAdminMenu();
      }
      showVotingMenu();
    },
    hotkeyOptionsAdmin,
    [showAdminMenu]
  );
  useHotkeys(SHOW_SETTINGS, showSettings, hotkeyOptions);
  useHotkeys(
    TOGGLE_SHOW_AUTHORS,
    (e: KeyboardEvent) => {
      e.preventDefault();
      dispatch(Actions.editBoard({showAuthors: !state.showAuthors}));
    },
    hotkeyOptionsAdmin,
    [state.showAuthors]
  );
  useHotkeys(
    TOGGLE_SHOW_OTHER_USERS_NOTES,
    (e: KeyboardEvent) => {
      e.preventDefault();
      dispatch(Actions.editBoard({showNotesOfOtherUsers: !state.showNotesOfOtherUsers}));
    },
    hotkeyOptionsAdmin,
    [state.showNotesOfOtherUsers]
  );
  useHotkeys(
    TOGGLE_COLUMN_VISIBILITY,
    (e: KeyboardEvent) => {
      e.preventDefault();
      dispatch(Actions.setShowHiddenColumns(!state.showHiddenColumns));
    },
    hotkeyOptionsAdmin,
    [state.showHiddenColumns]
  );

  return (
    <aside id="menu-bars" className={classNames("menu-bars", {"menu-bars--admin": showAdminMenu, "menu-bars--user": !showAdminMenu}, {"menu-bars--isAdmin": isAdmin})}>
      <section className={classNames("menu", "user-menu", {"menu-animation": animate})} onTransitionEnd={(event) => handleAnimate(event)}>
        <div className="menu__items">
          <MenuToggle
            direction="right"
            value={isReady}
            toggleStartLabel={t("MenuBars.markAsDone")}
            toggleStopLabel={t("MenuBars.unmarkAsDone")}
            icon={CheckIcon}
            onToggle={toggleReadyState}
            tabIndex={TabIndex.UserMenu}
          />
          <MenuToggle
            tabIndex={TabIndex.UserMenu + 1}
            direction="right"
            toggleStartLabel={t("MenuBars.raiseHand")}
            toggleStopLabel={t("MenuBars.lowerHand")}
            icon={RaiseHand}
            onToggle={toggleRaiseHand}
            value={raisedHand}
          />
          <MenuButton tabIndex={TabIndex.UserMenu + 2} direction="right" label={t("MenuBars.settings")} onClick={showSettings} icon={SettingsIcon} />
        </div>
      </section>
      {isAdmin && (
        <section className={classNames("menu", "admin-menu", {"menu-animation": animate})} onTransitionEnd={(event) => handleAnimate(event)}>
          <div className="menu__items">
            <MenuButton tabIndex={TabIndex.AdminMenu} direction="left" label="Timer" onClick={showTimerMenu} icon={TimerIcon} />
            <MenuButton tabIndex={TabIndex.AdminMenu + 1} direction="left" label="Voting" onClick={showVotingMenu} icon={VoteIcon} />
            <MenuToggle
              value={state.moderation}
              direction="left"
              toggleStartLabel={t("MenuBars.startFocusMode")}
              toggleStopLabel={t("MenuBars.stopFocusMode")}
              icon={FocusIcon}
              onToggle={toggleModeration}
              tabIndex={TabIndex.AdminMenu + 2}
              isFocusModeToggle
            />
          </div>
        </section>
      )}
      {isAdmin && (
        <button className="menu-bars__switch" onClick={toggleAdminMenu} aria-label={showAdminMenu ? t("MenuBars.switchToUserMenu") : t("MenuBars.switchToAdminMenu")}>
          <ToggleAddMenuIcon className="switch__icon switch__icon--add" aria-hidden />
          <ToggleSettingsMenuIcon className="switch__icon switch__icon--settings" aria-hidden />
        </button>
      )}
    </aside>
  );
};
