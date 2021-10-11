import {useState} from "react";
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
import {TimerButton} from "./MenuItem/variants/TimerButton";

import "./MenuBars.scss";

export function MenuBars() {
  const [showAdminMenu, toggleMenus] = useState(false);
  const [animate, setAnimate] = useState(false);

  const currentUser = Parse.User.current();
  const state = useAppSelector((rootState) => ({
    admins: rootState.users.admins,
    boardId: rootState.board.data!.id,
    timer: rootState.board.data?.timerUTCEndTime,
    moderation: rootState.board.data?.moderation.status,
  }));

  const isAdmin = state.admins.map((admin) => admin.id).indexOf(currentUser!.id) !== -1;

  const toggleVoting = (active: boolean) => {
    if (active) {
      store.dispatch(ActionFactory.addVoteConfiguration({boardId: state.boardId, voteLimit: 5, showVotesOfOtherUsers: false, allowMultipleVotesPerNote: true}));
    }
    store.dispatch(ActionFactory.editBoard({id: state.boardId, voting: active ? "active" : "disabled"}));
  };

  // const toggleTimer = (active: boolean) => {
  //   if (active) {
  //     store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 3 * 60000)));
  //   } else {
  //     store.dispatch(ActionFactory.cancelTimer());
  //   }
  // };

  const toggleModeration = (active: boolean) => {
    store.dispatch(ActionFactory.editBoard({id: state.boardId, moderation: {userId: Parse.User.current()?.id, status: active ? "active" : "disabled"}}));
  };

  const handleAnimate = (event: React.TransitionEvent<HTMLElement>) => {
    if (event.currentTarget.attributes.getNamedItem("class")?.nodeValue?.includes("menu-animation")) {
      setAnimate(false);
    }
  };

  return (
    <aside
      id="menu-bars"
      className={classNames(
        "menu-bars",
        {"menu-bars--admin": showAdminMenu, "menu-bars--user": !showAdminMenu},
        {"menu-bars--isAdmin": isAdmin},
        {"menu-bars--bottom": document.getElementById("menu-bars")?.classList.contains("menu-bars--bottom")}
      )}
    >
      <section className={classNames("menu", "user-menu", {"menu-animation": animate})} onTransitionEnd={(event) => handleAnimate(event)}>
        <div className="menu__items">
          <MenuToggle disabled direction="right" toggleStartLabel="Mark me as done" toggleStopLabel="Unmark me as done" icon={CheckIcon} onToggle={() => null} />
          <MenuButton disabled direction="right" label="Add image or giphy" icon={AddImageIcon} onClick={() => null} />
          <MenuButton disabled direction="right" label="Add sticker" icon={AddStickerIcon} onClick={() => null} />
          <MenuButton disabled direction="right" label="Settings" icon={SettingsIcon} onClick={() => null} />
        </div>
      </section>
      {isAdmin && (
        <section className={classNames("menu", "admin-menu", {"menu-animation": animate})} onTransitionEnd={(event) => handleAnimate(event)}>
          <div className="menu__items">
            <MenuToggle disabled direction="left" toggleStartLabel="Start column mode" toggleStopLabel="End column mode" icon={ColumnIcon} onToggle={() => null} />
            <TimerButton />
            <MenuToggle direction="left" toggleStartLabel="Start voting phase" toggleStopLabel="End voting phase" icon={VoteIcon} onToggle={toggleVoting} />
            <MenuToggle
              value={state.moderation === "active"}
              direction="left"
              toggleStartLabel="Start focused mode"
              toggleStopLabel="End focused mode"
              icon={FocusIcon}
              onToggle={toggleModeration}
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
