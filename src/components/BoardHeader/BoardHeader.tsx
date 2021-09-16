import {useState, useEffect} from "react";
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
  const endTime = useAppSelector((state) => state.board.data?.timerUTCEndTime);
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // @ts-ignore
  const [timeLeft, setTimeLeft] = useState(endTime ? endTime - new Date() : 0);

  useEffect(() => {
    // @ts-ignore
    const timer = setTimeout(() => {
      // @ts-ignore
      setTimeLeft(endTime ? (new Date(endTime.iso) - new Date()) / 1000 : 0);
    }, 1000);
  });

  return (
    <div className="board-header">
      {`${timeLeft}`}
      <HeaderLogo />
      <div className="board-header__infos">
        <div
          className={classNames("info-block", {"info-block--hoverable": props.currentUserIsModerator})}
          onClick={() => {
            if (props.currentUserIsModerator) setShowMenu(!showMenu);
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
      {props.currentUserIsModerator && <HeaderMenu open={showMenu} onClose={() => setShowMenu(false)} />}
      {/* Only render the participants if the users have loaded (this reduces unnecessary rerendering)  */}
      {users.length > 0 && (
        <ParticipantsList open={showParticipants} onClose={() => setShowParticipants(false)} participants={users} currentUserIsModerator={props.currentUserIsModerator} />
      )}
    </div>
  );
};
export default BoardHeader;
