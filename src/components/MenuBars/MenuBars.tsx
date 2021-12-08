import React, {useState} from "react";
import {ActionFactory} from "store/action";
import store, {useAppSelector} from "store";
import Parse from "parse";
import _ from "underscore";
import classNames from "classnames";
import {MenuToggle} from "components/MenuBars/MenuItem";
import {ReactComponent as RaiseHand} from "assets/icon-hand.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as FocusIcon} from "assets/icon-focus.svg";
import {ReactComponent as ToggleSettingsMenuIcon} from "assets/icon-toggle-settings-menu.svg";
import {ReactComponent as ToggleAddMenuIcon} from "assets/icon-toggle-add-menu.svg";
import {TabIndex} from "constants/tabIndex";
import {useTranslation} from "react-i18next";
import {TimerToggleButton} from "./MenuItem/variants/TimerToggleButton";
import {VoteConfigurationButton} from "./MenuItem/variants/VoteConfigurationButton";
import {ThemeToggleButton} from "./MenuItem/variants/ThemeToggleButton";

import "./MenuBars.scss";

export const MenuBars = () => {
  const {t} = useTranslation();

  const [showAdminMenu, toggleMenus] = useState(false);
  const [animate, setAnimate] = useState(false);

  const currentUser = Parse.User.current();
  const state = useAppSelector(
    (rootState) => ({
      admins: rootState.users.admins,
      allUsers: rootState.users.all,
      boardId: rootState.board.data!.id,
      timer: rootState.board.data?.timerUTCEndTime,
      voting: rootState.board.data?.voting,
      moderation: rootState.board.data?.moderation.status,
    }),
    _.isEqual
  );

  const isAdmin = state.admins.map((admin) => admin.id).indexOf(currentUser!.id) !== -1;
  const isReady = state.allUsers.find((user) => user.id === currentUser!.id)?.ready;
  const raisedHand = state.allUsers.find((user) => user.id === currentUser!.id)?.raisedHand;

  const toggleModeration = (active: boolean) => {
    store.dispatch(ActionFactory.editBoard({id: state.boardId, moderation: {userId: Parse.User.current()?.id, status: active ? "active" : "disabled"}}));
  };

  const toggleReadyState = () => {
    store.dispatch(ActionFactory.setUserReadyStatus(!isReady));
  };

  const handleAnimate = (event: React.TransitionEvent<HTMLElement>) => {
    if (event.currentTarget.attributes.getNamedItem("class")?.nodeValue?.includes("menu-animation")) {
      setAnimate(false);
    }
  };

  const toggleRaiseHand = (active: boolean) => {
    store.dispatch(ActionFactory.setRaisedHandStatus({userId: [Parse.User.current()!.id], raisedHand: active}));
  };

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
          <ThemeToggleButton tabIndex={TabIndex.UserMenu + 2} direction="right" />
        </div>
      </section>
      {isAdmin && (
        <section className={classNames("menu", "admin-menu", {"menu-animation": animate})} onTransitionEnd={(event) => handleAnimate(event)}>
          <div className="menu__items">
            <TimerToggleButton tabIndex={TabIndex.AdminMenu} />
            <VoteConfigurationButton tabIndex={TabIndex.AdminMenu + 8} />
            <MenuToggle
              value={state.moderation === "active"}
              direction="left"
              toggleStartLabel={t("MenuBars.startFocusMode")}
              toggleStopLabel={t("MenuBars.stopFocusMode")}
              icon={FocusIcon}
              onToggle={toggleModeration}
              tabIndex={TabIndex.AdminMenu + 15}
            />
          </div>
        </section>
      )}
      {isAdmin && (
        <button
          className="menu-bars__switch"
          onClick={() => {
            setAnimate(true);
            toggleMenus((prevState) => !prevState);
          }}
        >
          <ToggleAddMenuIcon className="switch__icon switch__icon--add" />
          <ToggleSettingsMenuIcon className="switch__icon switch__icon--settings" />
        </button>
      )}
    </aside>
  );
};
