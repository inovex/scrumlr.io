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
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as ToggleSettingsMenuIcon} from "assets/icon-toggle-settings-menu.svg";
import {ReactComponent as ToggleAddMenuIcon} from "assets/icon-toggle-add-menu.svg";
import {TabIndex} from "constants/tabIndex";
import {TimerToggleButton} from "./MenuItem/variants/TimerToggleButton";
import "./MenuBars.scss";

export function MenuBars() {
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

  const toggleVoting = (active: boolean) => {
    if (active) {
      store.dispatch(ActionFactory.addVoteConfiguration({boardId: state.boardId, voteLimit: 5, showVotesOfOtherUsers: false, allowMultipleVotesPerNote: true}));
    }
    store.dispatch(ActionFactory.editBoard({id: state.boardId, voting: active ? "active" : "disabled"}));
  };

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

  return (
    <aside id="menu-bars" className={classNames("menu-bars", {"menu-bars--admin": showAdminMenu, "menu-bars--user": !showAdminMenu}, {"menu-bars--isAdmin": isAdmin})}>
      <section className={classNames("menu", "user-menu", {"menu-animation": animate})} onTransitionEnd={(event) => handleAnimate(event)}>
        <div className="menu__items">
          <MenuToggle
            tabIndex={TabIndex.UserMenu}
            direction="right"
            value={isReady}
            toggleStartLabel="Mark me as done"
            toggleStopLabel="Unmark me as done"
            icon={CheckIcon}
            onToggle={toggleReadyState}
          />
          <MenuButton tabIndex={TabIndex.UserMenu + 1} disabled direction="right" label="Add image or giphy" icon={AddImageIcon} onClick={() => null} />
          <MenuButton tabIndex={TabIndex.UserMenu + 2} disabled direction="right" label="Add sticker" icon={AddStickerIcon} onClick={() => null} />
          <MenuButton tabIndex={TabIndex.UserMenu + 3} disabled direction="right" label="Settings" icon={SettingsIcon} onClick={() => null} />
        </div>
      </section>
      {isAdmin && (
        <section className={classNames("menu", "admin-menu", {"menu-animation": animate})} onTransitionEnd={(event) => handleAnimate(event)}>
          <div className="menu__items">
            <MenuToggle
              tabIndex={TabIndex.AdminMenu}
              disabled
              direction="left"
              toggleStartLabel="Start column mode"
              toggleStopLabel="End column mode"
              icon={ColumnIcon}
              onToggle={() => null}
            />
            <TimerToggleButton tabIndex={TabIndex.AdminMenu + 1} />
            <MenuToggle
              value={state.voting === "active"}
              direction="left"
              toggleStartLabel="Start voting phase"
              toggleStopLabel="End voting phase"
              icon={VoteIcon}
              onToggle={toggleVoting}
              tabIndex={TabIndex.AdminMenu + 10}
            />
            <MenuToggle
              value={state.moderation === "active"}
              direction="left"
              toggleStartLabel="Start focused mode"
              toggleStopLabel="End focused mode"
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
}
