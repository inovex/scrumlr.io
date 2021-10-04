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

const BoardHeader = (props: BoardHeaderProps) => {
  const users = useAppSelector((state) => state.users.all.filter((user) => user.online));
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <div className="board-header">
      <HeaderLogo />
      <div className="board-header__infos">
        <div
          className={classNames("info-block", "info-block--hoverable")}
          onClick={() => {
            setShowMenu(!showMenu);
          }}
          role="dialog"
        >
          <p className="board-header__status">{props.boardstatus}</p>
          <div className="board-header__title-block">
            <img className="board-header__status-image" src={lock} alt="Private Session" />
            <h1 className="board-header__title">{props.name}</h1>
          </div>
        </div>
      </div>
      <div className="board-header__users" onClick={() => setShowParticipants((showParticipants) => !showParticipants)}>
        <BoardUsers />
      </div>
      <HeaderMenu open={showMenu} onClose={() => setShowMenu(false)} currentUserIsModerator={props.currentUserIsModerator} />
      {/* Only render the participants if the users have loaded (this reduces unnecessary rerendering)  */}
      {users.length > 0 && (
        <ParticipantsList open={showParticipants} onClose={() => setShowParticipants(false)} participants={users} currentUserIsModerator={props.currentUserIsModerator} />
      )}
    </div>
  );
};
export default BoardHeader;
