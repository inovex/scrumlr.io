import {VFC, useState} from "react";
import {ReactComponent as LockIcon} from "assets/icon-lock.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {BoardUsers} from "components/BoardUsers";
import {useAppSelector} from "store";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {ParticipantsList} from "components/BoardHeader/ParticipantsList";
import {Link} from "react-router-dom";
import "./BoardHeader.scss";
import {useTranslation} from "react-i18next";
import {TabIndex} from "constants/tabIndex";

export interface BoardHeaderProps {
  boardstatus: string;
  name: string;
  currentUserIsModerator: boolean;
}

export var BoardHeader: VFC<BoardHeaderProps> = function (props) {
  const {t} = useTranslation();

  const users = useAppSelector((state) => state.users.all.filter((user) => user.online));
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <header className="board-header">
      <Link to="/" aria-label="Return to homepage">
        <button tabIndex={TabIndex.BoardHeader} className="board-header__link">
          <ScrumlrLogo className="board-header__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
        </button>
      </Link>

      <div className="board-header__name-and-settings">
        <button
          className="board-header_name-and-settings-button"
          onClick={() => {
            setShowMenu(!showMenu);
          }}
          aria-haspopup
          aria-pressed={showMenu}
          tabIndex={TabIndex.BoardHeader + 1}
        >
          <div className="board-header__access-policy-status">
            <LockIcon className="board-header__access-policy-status-icon" title={props.boardstatus} />
            <span>{props.boardstatus}</span>
          </div>
          <div className="board-header__name-container">
            <h1 className="board-header__name">{props.name || "scrumlr.io"}</h1>
            <SettingsIcon className="board-header__settings-icon" />
          </div>
        </button>
      </div>

      <button
        aria-label={t("BoardHeader.showParticipants")}
        tabIndex={TabIndex.BoardHeader + 2}
        aria-haspopup
        aria-pressed={showParticipants}
        className="board-header__users"
        onClick={() => setShowParticipants(!showParticipants)}
      >
        <BoardUsers />
      </button>

      <HeaderMenu open={showMenu} onClose={() => setShowMenu(false)} currentUserIsModerator={props.currentUserIsModerator} />
      {/* Only render the participants if the users have loaded (this reduces unnecessary rerendering)  */}
      {users.length > 0 && (
        <ParticipantsList open={showParticipants} onClose={() => setShowParticipants(false)} participants={users} currentUserIsModerator={props.currentUserIsModerator} />
      )}
    </header>
  );
};
