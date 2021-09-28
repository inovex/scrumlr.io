import {useState} from "react";
import {ActionFactory} from "store/action";
import store, {useAppSelector} from "store";
import Parse from "parse";
import classNames from "classnames";

import MenuButton from "components/MenuBars/MenuItem/MenuButton";
import MenuToggle from "components/MenuBars/MenuItem/MenuToggle";

import {ReactComponent as AddImageIcon} from "assets/icon-addimage.svg";
import {ReactComponent as AddStickerIcon} from "assets/icon-addsticker.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {ReactComponent as ColumnIcon} from "assets/icon-column.svg";
import {ReactComponent as FocusIcon} from "assets/icon-focus.svg";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as ToggleSettingsMenuIcon} from "assets/icon-toggle-settings-menu.svg";
import {ReactComponent as ToggleAddMenuIcon} from "assets/icon-toggle-add-menu.svg";
import {TimerButton} from "./MenuDropdown/TimerButton";

import "./MenuBars.scss";
import {DropdownButton} from "./MenuDropdown/DropdownButton";
import Dropdown from "components/MenuBars/MenuDropdown/Dropdown";

function MenuBars() {
  const [showAdminMenu, toggleMenus] = useState(false);

  const currentUser = Parse.User.current();
  const state = useAppSelector((state) => ({
    admins: state.users.admins,
    boardId: state.board.data!.id,
    timer: state.board.data?.timerUTCEndTime,
  }));

  const isAdmin = state.admins.map((admin) => admin.id).indexOf(currentUser!.id) !== -1;

  const toggleVoting = (active: boolean) => {
    if (active) {
      store.dispatch(ActionFactory.addVoteConfiguration({boardId: state.boardId, voteLimit: 5, showVotesOfOtherUsers: false, allowMultipleVotesPerNote: true}));
    }
    store.dispatch(ActionFactory.editBoard({id: state.boardId, voting: active ? "active" : "disabled"}));
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
      <section className="menu user-menu">
        <div className="menu__items">
          <MenuToggle direction="right" toggleStartLabel="Mark me as done" toggleStopLabel="Unmark me as done" icon={CheckIcon} onToggle={() => null} />
          <DropdownButton direction="right" label="Add image or giphy" icon={AddImageIcon}>
            <Dropdown>
              <Dropdown.Main>
                <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 3 * 60000)))}>1 Minute</Dropdown.ItemButton>
                <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 3 * 60000)))}>3 Minute</Dropdown.ItemButton>
                <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() + 5 * 60000)))}>5 Minute</Dropdown.ItemButton>
                <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.setTimer(new Date(new Date().getTime() * 60000)))} />
              </Dropdown.Main>
              <Dropdown.Footer>
                <Dropdown.ItemButton onClick={() => store.dispatch(ActionFactory.cancelTimer())}>Cancel Timer</Dropdown.ItemButton>
              </Dropdown.Footer>
            </Dropdown>
          </DropdownButton>
          <MenuButton disabled direction="right" label="Add sticker" icon={AddStickerIcon} onClick={() => null} />
          <MenuButton disabled direction="right" label="Settings" icon={SettingsIcon} onClick={() => null} />
        </div>
      </section>
      {isAdmin && (
        <section className="menu admin-menu">
          <div className="menu__items">
            <MenuToggle disabled direction="left" toggleStartLabel="Start column mode" toggleStopLabel="End column mode" icon={ColumnIcon} onToggle={() => null} />
            <TimerButton />
            <MenuToggle direction="left" toggleStartLabel="Start voting phase" toggleStopLabel="End voting phase" icon={VoteIcon} onToggle={toggleVoting} />
            <MenuToggle disabled direction="left" toggleStartLabel="Start focused mode" toggleStopLabel="End focused mode" icon={FocusIcon} onToggle={() => null} />
          </div>
        </section>
      )}
      {isAdmin && (
        <button className="menu-bars__switch" onClick={() => toggleMenus((prevState) => !prevState)}>
          <ToggleAddMenuIcon className="switch__icon switch__icon--add" />
          <ToggleSettingsMenuIcon className="switch__icon switch__icon--settings" />
        </button>
      )}
    </aside>
  );
}

export default MenuBars;
