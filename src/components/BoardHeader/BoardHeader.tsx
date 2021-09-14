import {useState} from "react";
import classNames from "classnames";
import lock from "assets/icon-lock.svg";
import BoardUsers from "components/BoardUsers/BoardUsers";
import {useAppSelector} from "store";
import HeaderLogo from "./HeaderLogo/HeaderLogo";
import {HeaderMenu} from "./HeaderMenu/HeaderMenu";
import {ParticipantsList} from "./ParticipantsList";

import "./BoardHeader.scss";

export interface BoardHeaderProps {
  boardstatus: string;
  name: string;
  currentUserIsModerator: boolean;
}

const BoardHeader = ({name, boardstatus, currentUserIsModerator}: BoardHeaderProps) => {
  const users = useAppSelector((state) => state.users.all.filter((user) => user.online));
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

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
      <div className="board-header__users" onClick={() => setShowParticipants((showParticipants) => !showParticipants)}>
        <BoardUsers />
      </div>
      {currentUserIsModerator && <HeaderMenu open={showMenu} onClose={() => setShowMenu(false)} />}
      <ParticipantsList open={showParticipants} onClose={() => setShowParticipants(false)} participants={users} />
    </div>
  );
};
export default BoardHeader;
