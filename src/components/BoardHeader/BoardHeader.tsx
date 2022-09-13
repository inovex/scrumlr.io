import {useState, VFC} from "react";
import {ReactComponent as LockIcon} from "assets/icon-lock.svg";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {ReactComponent as GlobeIcon} from "assets/icon-globe.svg";
import {ReactComponent as KeyIcon} from "assets/icon-key.svg";
import {BoardUsers} from "components/BoardUsers";
import store, {useAppSelector} from "store";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {useTranslation} from "react-i18next";
import {TabIndex} from "constants/tabIndex";
import {Actions} from "store/action";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {useNavigate} from "react-router-dom";
import {shallowEqual} from "react-redux";
import "./BoardHeader.scss";
import {DEFAULT_BOARD_NAME} from "../../constants/misc";

export interface BoardHeaderProps {
  currentUserIsModerator: boolean;
}

export const BoardHeader: VFC<BoardHeaderProps> = (props) => {
  const {t} = useTranslation();
  const state = useAppSelector(
    (rootState) => ({
      name: rootState.board.data?.name,
      accessPolicy: rootState.board.data?.accessPolicy,
    }),
    shallowEqual
  );

  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  return (
    <>
      {showConfirmationDialog && (
        <ConfirmationDialog
          headline={t("ConfirmationDialog.returnToHomepage")}
          acceptMessage={t("ConfirmationDialog.yes")}
          onAccept={() => {
            store.dispatch(Actions.leaveBoard());
            navigate("/");
          }}
          declineMessage={t("ConfirmationDialog.no")}
          onDecline={() => setShowConfirmationDialog(false)}
        />
      )}
      <header className="board-header">
        <button tabIndex={TabIndex.BoardHeader} className="board-header__link" onClick={() => setShowConfirmationDialog(true)}>
          <ScrumlrLogo className="board-header__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
        </button>

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
              {
                {
                  BY_INVITE: <LockIcon className="board-header__access-policy-status-icon" />,
                  BY_PASSPHRASE: <KeyIcon className="board-header__access-policy-status-icon" />,
                  PUBLIC: <GlobeIcon className="board-header__access-policy-status-icon" />,
                }[state.accessPolicy!]
              }
              <span>{t(`AccessPolicy.${state.accessPolicy}`)}</span>
            </div>
            <div className="board-header__name-container">
              <h1 className="board-header__name">{state.name || DEFAULT_BOARD_NAME}</h1>
            </div>
          </button>
        </div>

        <div className="board-header__users">
          <BoardUsers />

          <button
            className="board-header__share-button"
            onClick={(e) => {
              e.stopPropagation();
              navigate("settings/share");
            }}
            tabIndex={TabIndex.BoardHeader + 3}
          >
            <PlusIcon />
          </button>
        </div>

        <HeaderMenu open={showMenu} onClose={() => setShowMenu(false)} currentUserIsModerator={props.currentUserIsModerator} />
        {/* Only render the participants if the users have loaded (this reduces unnecessary rerendering)  */}
      </header>
    </>
  );
};
