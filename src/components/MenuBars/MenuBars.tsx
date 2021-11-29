import React, {useState} from "react";
import {ActionFactory} from "store/action";
import store, {useAppSelector} from "store";
import Parse from "parse";
import classNames from "classnames";
import {MenuButton, MenuToggle} from "components/MenuBars/MenuItem";
import {ReactComponent as AddImageIcon} from "assets/icon-addimage.svg";
import {ReactComponent as AddStickerIcon} from "assets/icon-addsticker.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {ReactComponent as ColumnIcon} from "assets/icon-column.svg";
import {ReactComponent as FocusIcon} from "assets/icon-focus.svg";
import {ReactComponent as ToggleSettingsMenuIcon} from "assets/icon-toggle-settings-menu.svg";
import {ReactComponent as ToggleAddMenuIcon} from "assets/icon-toggle-add-menu.svg";
import {Link} from "react-router-dom";
import {TabIndex} from "constants/tabIndex";
import {useTranslation} from "react-i18next";
import {TimerToggleButton} from "./MenuItem/variants/TimerToggleButton";
import {VoteConfigurationButton} from "./MenuItem/variants/VoteConfigurationButton";

import "./MenuBars.scss";

export var MenuBars = function () {
  const {t} = useTranslation();

  const [showAdminMenu, toggleMenus] = useState(false);
  const [animate, setAnimate] = useState(false);

  const currentUser = Parse.User.current();
  const state = useAppSelector((rootState) => ({
    admins: rootState.users.admins,
    allUsers: rootState.users.all,
    boardId: rootState.board.data!.id,
    timer: rootState.board.data?.timerUTCEndTime,
    voting: rootState.board.data?.voting,
    moderation: rootState.board.data?.moderation.status,
  }));

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
            icon={AddImageIcon}
            onToggle={toggleRaiseHand}
            value={raisedHand}
          />
          <Link to="/">
            <MenuButton tabIndex={TabIndex.UserMenu + 2} direction="right" label={t("MenuBars.returnToHomepage")} icon={AddStickerIcon} onClick={() => null} />
          </Link>
          <MenuButton tabIndex={TabIndex.UserMenu + 3} disabled direction="right" label={t("MenuBars.settings")} icon={SettingsIcon} onClick={() => null} />
        </div>
      </section>
      {isAdmin && (
        <section className={classNames("menu", "admin-menu", {"menu-animation": animate})} onTransitionEnd={(event) => handleAnimate(event)}>
          <div className="menu__items">
            <MenuToggle
              tabIndex={TabIndex.AdminMenu}
              disabled
              direction="left"
              toggleStartLabel={t("MenuBars.editColumns")}
              toggleStopLabel={t("MenuBars.stopEditingColumns")}
              icon={ColumnIcon}
              onToggle={() => null}
            />
            <TimerToggleButton tabIndex={TabIndex.AdminMenu + 1} />
            <VoteConfigurationButton tabIndex={TabIndex.AdminMenu + 2} />
            <MenuToggle
              value={state.moderation === "active"}
              direction="left"
              toggleStartLabel={t("MenuBars.startFocusMode")}
              toggleStopLabel={t("MenuBars.stopFocusMode")}
              icon={FocusIcon}
              onToggle={toggleModeration}
              tabIndex={TabIndex.AdminMenu + 11}
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
