import {useState} from "react";
import classNames from "classnames";
import lock from "assets/icon-lock.svg";
import BoardUsers from "components/BoardUsers/BoardUsers";
import HeaderLogo from "./HeaderLogo/HeaderLogo";
import {HeaderMenu} from "./HeaderMenu/HeaderMenu";
import "./BoardHeader.scss";

export interface BoardHeaderProps {
  boardstatus: string;
  name: string;
  currentUserIsModerator: boolean;
}

const BoardHeader = ({name, boardstatus, currentUserIsModerator}: BoardHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="board-header">
      <HeaderLogo />
      <div className="board-header__infos">
        <div
          className={classNames("info-block", {"info-block--hoverable": currentUserIsModerator})}
          onClick={() => {
            if (currentUserIsModerator) setShowMenu(!showMenu);
          }}
          role="dialog"
        >
          <p className="board-header__status">{boardstatus}</p>
          <div className="board-header__title-block">
            <img className="board-header__status-image" src={lock} alt="Private Session" />
            <h1 className="board-header__title">{name}</h1>
          </div>
        </div>
      </div>
      <div className="board-header__users">
        <BoardUsers />
      </div>
      {currentUserIsModerator && <HeaderMenu open={showMenu} onClose={() => setShowMenu(false)} />}
    </div>
  );
};
export default BoardHeader;
