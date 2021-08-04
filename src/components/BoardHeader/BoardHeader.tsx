import {useState} from "react";
import "./BoardHeader.scss";
import lock from "assets/icon-lock.svg";
import BoardUsers from "components/BoardUsers/BoardUsers";
import HeaderLogo from "./HeaderLogo/HeaderLogo";
import {HeaderMenu} from "./HeaderMenu/HeaderMenu";

export interface BoardHeaderProps {
  boardstatus: string;
  name: string;
}

const BoardHeader = ({name, boardstatus}: BoardHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="board-header">
      <HeaderLogo />
      <div className="board-header__infos">
        <div className="info-block" onClick={() => setShowMenu(!showMenu)} role="dialog">
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
      <HeaderMenu open={showMenu} onClose={() => setShowMenu(false)} />
    </div>
  );
};
export default BoardHeader;
