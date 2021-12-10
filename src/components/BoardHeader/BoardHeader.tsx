import {VFC, useState} from "react";
import {ReactComponent as LockIcon} from "assets/icon-lock.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {BoardUsers} from "components/BoardUsers";
import store, {useAppSelector} from "store";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {ParticipantsList} from "components/BoardHeader/ParticipantsList";
import {Link} from "react-router-dom";
import "./BoardHeader.scss";
import {useTranslation} from "react-i18next";
import {TabIndex} from "constants/tabIndex";
import {ActionFactory} from "store/action";
import {shallowEqual} from "react-redux";

export interface BoardHeaderProps {
  currentUserIsModerator: boolean;
}

export const BoardHeader: VFC<BoardHeaderProps> = (props) => {
  const {t} = useTranslation();
  const state = useAppSelector(
    (rootState) => ({
      name: rootState.board.data?.name,
      accessPolicy: rootState.board.data?.accessPolicy === "Public" ? t("Board.publicSession") : t("Board.privateSession"),
    }),
    shallowEqual
  );

  const [showMenu, setShowMenu] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <header className="board-header">
      <Link to="/" aria-label="Return to homepage">
        <button tabIndex={TabIndex.BoardHeader} className="board-header__link" onClick={() => store.dispatch(ActionFactory.leaveBoard())}>
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
            <LockIcon className="board-header__access-policy-status-icon" title={state.accessPolicy} />
            <span>{state.accessPolicy}</span>
          </div>
          <div className="board-header__name-container">
            <h1 className="board-header__name">{state.name || "scrumlr.io"}</h1>
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

      <ParticipantsList open={showParticipants} onClose={() => setShowParticipants(false)} currentUserIsModerator={props.currentUserIsModerator} />
    </header>
  );
};
