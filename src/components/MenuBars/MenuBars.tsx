import {useState} from "react";
import Parse from "parse";
import classNames from "classnames";
import {useSelector} from "react-redux";
import {ApplicationState} from "types/store";
import MenuButton from "components/MenuBars/MenuItem/MenuButton";
import MenuToggle from "components/MenuBars/MenuItem/MenuToggle";
import {ReactComponent as AddImageIcon} from "assets/icon-addimage.svg";
import {ReactComponent as AddStickerIcon} from "assets/icon-addsticker.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {ReactComponent as ColumnIcon} from "assets/icon-column.svg";
import {ReactComponent as FocusIcon} from "assets/icon-focus.svg";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as ToggleSettingsMenuIcon} from "assets/icon-toggle-settings-menu.svg";
import {ReactComponent as ToggleAddMenuIcon} from "assets/icon-toggle-add-menu.svg";
import "./MenuBars.scss";

function MenuBars() {
  const [showAdminMenu, toggleMenus] = useState(false);

  const currentUser = Parse.User.current();
  const admins = useSelector((state: ApplicationState) => state.users.admins);

  const isAdmin = admins.map((admin) => admin.id).indexOf(currentUser!.id) !== -1;

  return (
    <div className={classNames("menu-bars", {"menu-bars--admin": showAdminMenu, "menu-bars--user": !showAdminMenu}, {"menu-bars--isAdmin": isAdmin})}>
      <div className="menu user-menu">
        <div className="menu__items">
          <MenuToggle direction="right" toggleStartLabel="Mark me as done" toggleStopLabel="Unmark me as done" icon={CheckIcon} onToggle={() => null} />
          <MenuButton direction="right" label="Add image or giphy" icon={AddImageIcon} onClick={() => null} />
          <MenuButton direction="right" label="Add sticker" icon={AddStickerIcon} onClick={() => null} />
          <MenuButton direction="right" label="Settings" icon={SettingsIcon} onClick={() => null} />
        </div>
      </div>
      {isAdmin && (
        <div className="menu admin-menu">
          <div className="menu__items">
            <MenuToggle direction="left" toggleStartLabel="Start column mode" toggleStopLabel="End column mode" icon={ColumnIcon} onToggle={() => null} />
            <MenuToggle direction="left" toggleStartLabel="Start timer" toggleStopLabel="Stop timer" icon={TimerIcon} onToggle={() => null} />
            <MenuToggle direction="left" toggleStartLabel="Start voting phase" toggleStopLabel="End voting phase" icon={VoteIcon} onToggle={() => null} />
            <MenuToggle direction="left" toggleStartLabel="Start focused mode" toggleStopLabel="End focused mode" icon={FocusIcon} onToggle={() => null} />
          </div>
        </div>
      )}
      {isAdmin && (
        <button className="menu-bars__switch" onClick={() => toggleMenus((prevState) => !prevState)}>
          <ToggleAddMenuIcon className="switch__icon switch__icon--add" />
          <ToggleSettingsMenuIcon className="switch__icon switch__icon--settings" />
        </button>
      )}
    </div>
  );
}

export default MenuBars;
