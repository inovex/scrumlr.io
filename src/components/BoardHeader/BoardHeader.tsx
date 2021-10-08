import {useState} from "react";
import classNames from "classnames";
import lock from "assets/icon-lock.svg";
import BoardUsers from "components/BoardUsers/BoardUsers";
import {useAppSelector} from "store";
import {ScrumlrLogo} from "components/ScrumlrLogo";
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
      <ScrumlrLogo className="board-header__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
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
