import {useState} from "react";
import {LockClosedIcon, OpenIcon as GlobeIcon, KeyProtectedIcon, LogoutIcon} from "components/Icon";
import {BoardUsers} from "components/BoardUsers";
import {useAppDispatch, useAppSelector} from "store";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {useTranslation} from "react-i18next";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {shallowEqual} from "react-redux";
import {leaveBoard} from "store/features";
import {DEFAULT_BOARD_NAME} from "constants/misc";
import {Tooltip} from "components/Tooltip";
import {ShareButton} from "components/ShareButton";
import {useTextOverflow} from "utils/hooks/useTextOverflow";
import "./BoardHeader.scss";

type BoardHeaderProps = {
  currentUserIsModerator: boolean;
};

export const BoardHeader = (props: BoardHeaderProps) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const state = useAppSelector(
    (rootState) => ({
      name: rootState.board.data?.name,
      accessPolicy: rootState.board.data!.accessPolicy,
    }),
    shallowEqual
  );

  const boardName = state.name || DEFAULT_BOARD_NAME;

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const {isTextTruncated, textRef} = useTextOverflow<HTMLHeadingElement>(boardName);

  return (
    <>
      {showConfirmationDialog && (
        <ConfirmationDialog
          title={t("ConfirmationDialog.returnToHomepage")}
          onAccept={() => {
            dispatch(leaveBoard());
            window.location.pathname = "/";
          }}
          onDecline={() => setShowConfirmationDialog(false)}
          icon={LogoutIcon}
        />
      )}
      <header className="board-header">
        <button className="board-header__link" onClick={() => setShowConfirmationDialog(true)} aria-label={t("BoardHeader.returnToHomepage")}>
          <ScrumlrLogo className="board-header__logo" />
        </button>

        <button
          id="board-header__name-and-settings"
          className="board-header_name-and-settings"
          onClick={() => {
            setShowMenu(!showMenu);
          }}
          aria-haspopup
          aria-pressed={showMenu}
        >
          <div className="board-header__access-policy-status">
            {
              {
                BY_INVITE: <LockClosedIcon className="board-header__access-policy-status-icon" />,
                BY_PASSPHRASE: <KeyProtectedIcon className="board-header__access-policy-status-icon" />,
                PUBLIC: <GlobeIcon className="board-header__access-policy-status-icon" />,
              }[state.accessPolicy!]
            }
            <span>{t(`AccessPolicy.${state.accessPolicy}`)}</span>
          </div>
          <div className="board-header__name-container">
            <h1 ref={textRef} data-clarity-mask="True" className="board-header__name">
              {boardName}
            </h1>
          </div>
          {isTextTruncated.horizontal && <Tooltip anchorId="board-header__name-and-settings">{boardName}</Tooltip>}
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
