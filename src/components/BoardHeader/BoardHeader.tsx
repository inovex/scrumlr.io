import {useState, VFC} from "react";
import {LockClosed, Open as Globe, KeyProtected, Share} from "components/Icon";
import {BoardUsers} from "components/BoardUsers";
import store, {useAppSelector} from "store";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {useTranslation} from "react-i18next";
import {Actions} from "store/action";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {shallowEqual} from "react-redux";
import "./BoardHeader.scss";
import {ShareButton} from "components/ShareButton";
import {Tooltip} from "react-tooltip";
import XRSessionButton from "components/XR/XRSessionButton/XRSessionButton";
import {DEFAULT_BOARD_NAME} from "../../constants/misc";

export interface BoardHeaderProps {
  currentUserIsModerator: boolean;
}

export const BoardHeader: VFC<BoardHeaderProps> = (props) => {
  const {t} = useTranslation();
  const state = useAppSelector(
    (rootState) => ({
      name: rootState.board.data?.name,
      accessPolicy: rootState.board.data!.accessPolicy,
      xrActive: rootState.view.xrActive,
    }),
    shallowEqual
  );

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  return (
    <>
      {showConfirmationDialog && (
        <ConfirmationDialog
          title={t("ConfirmationDialog.returnToHomepage")}
          onAccept={() => {
            store.dispatch(Actions.leaveBoard());
            window.location.pathname = "/";
          }}
          onDecline={() => setShowConfirmationDialog(false)}
          icon={Share}
        />
      )}
      <header className="board-header">
        <button className="board-header__link" onClick={() => setShowConfirmationDialog(true)} aria-label={t("BoardHeader.returnToHomepage")}>
          <ScrumlrLogo className="board-header__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
        </button>

        <div className="board-header_xr-button">
          <XRSessionButton />
        </div>

        <button
          className="board-header_name-and-settings"
          onClick={() => {
            setShowMenu(!showMenu);
          }}
          aria-haspopup
          aria-pressed={showMenu}
          id="board-header__name-and-settings"
          data-tooltip-content={state.name || DEFAULT_BOARD_NAME}
        >
          <div className="board-header__access-policy-status">
            {
              {
                BY_INVITE: <LockClosed className="board-header__access-policy-status-icon" />,
                BY_PASSPHRASE: <KeyProtected className="board-header__access-policy-status-icon" />,
                PUBLIC: <Globe className="board-header__access-policy-status-icon" />,
              }[state.accessPolicy!]
            }
            <span>{t(`AccessPolicy.${state.accessPolicy}`)}</span>
          </div>
          <div className="board-header__name-container">
            <h1 className="board-header__name">{state.name || DEFAULT_BOARD_NAME}</h1>
          </div>
          <Tooltip
            anchorSelect="#board-header__name-and-settings"
            float
            variant={document.documentElement.getAttribute("theme") === "dark" ? "dark" : "light"}
            delayShow={500}
            style={{zIndex: 999}}
          />
        </button>

        <div className="board-header__users">
          <BoardUsers />
          <ShareButton />
        </div>

        <HeaderMenu open={showMenu} onClose={() => setShowMenu(false)} currentUserIsModerator={props.currentUserIsModerator} />
      </header>
    </>
  );
};
