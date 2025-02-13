import classNames from "classnames";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "components/Button";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import TextareaAutosize from "react-autosize-textarea";
import {FavouriteButton} from "components/Templates"; // TODO
import {ReactComponent as MenuIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as ColumnsIcon} from "assets/icons/columns.svg";
import {ReactComponent as NextIcon} from "assets/icons/next.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {ReactComponent as TrashIcon} from "assets/icons/trash.svg";
import {ReactComponent as EditIcon} from "assets/icons/edit.svg";
import {ReactComponent as MultipleUserIcon} from "assets/icons/multiple-user.svg";
import {ReactComponent as FilePdfIcon} from "assets/icons/file-pdf.svg";
import {ReactComponent as ShareIcon} from "assets/icons/share.svg";

// import {ReactComponent as CalendarIcon} from "assets/icons/calendar-days.svg";
import "./SessionCard.scss";
import {useNavigate} from "react-router";
import {createBoardFromSession, deleteBoard, Session} from "../../../store/features";
import {useAppDispatch} from "../../../store";
import {ConfirmationDialog} from "../../ConfirmationDialog";
import {Trash} from "../../Icon";

// import {Printer} from "../../Icon";
// import {SettingsButton} from "../../SettingsDialog/Components/SettingsButton";

type SessionCardProps = {
  session: Session;
};

export const SessionCard = ({session}: SessionCardProps) => {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showMiniMenu, setShowMiniMenu] = useState(false);

  const closeMenu = () => {
    setShowMiniMenu(false);
  };

  // const deleteSessionInCard = () => {
  //   dispatch(deleteSession({id: session.id})); // TODO
  //   dispatch(deleteBoard());
  // };

  const createBoard = () => {
    dispatch(createBoardFromSession(session))
      .unwrap()
      .then((boardId) => navigate(`/board/${boardId}`)); // TODO: this creates a new id each time, it should use the session id tho
  };

  const navigateToEdit = () => {
    //   createBoard();
    //   dispatch(editBoard(session.id)); // TODO
  };

  // const exportBoard = () => {
  //   dispatch(deleteBoard());
  // };

  const renderMenu = () =>
    showMiniMenu ? (
      <MiniMenu
        className={classNames("session-card__menu", "session-card__menu--open")}
        items={[
          {label: "Delete", element: <TrashIcon />, onClick: () => setShowConfirmationDialog(true)}, // TODO: deleteSessionInCard
          {
            label: t("ExportBoardOption.openPrintView"),
            element: <FilePdfIcon />,
            onClick: () => {
              createBoard(); // TODO: how do i fix this? this now creates a board first and when you then navigate back with the browsers navigation or directly over the url you
              // TODO: get the correct settings dialog displayed. without the createboard the boardid is missing
              navigate("settings/export");
            },
          },
          {label: "Share", element: <ShareIcon />, onClick: () => navigate("settings/share")},
          {label: "Edit", element: <EditIcon />, onClick: navigateToEdit}, // TODO: editBoard
          {label: "Close", element: <CloseIcon />, onClick: closeMenu},
        ]}
      />
    ) : (
      <MenuIcon className={classNames("template-card__menu", "template-card__icon", "template-card__icon--menu")} onClick={() => setShowMiniMenu(true)} />
    );

  return (
    <div className="session-card">
      <FavouriteButton className="session-card__favourite" active={session.favourite} onClick={() => {}} />
      <div className={classNames("session-card__head")}>
        <input className="session-card__title" type="text" value={session.name} disabled />
      </div>
      {renderMenu()}
      <TextareaAutosize
        className={classNames("session-card__description")}
        value={session.description}
        disabled
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
      <ColumnsIcon className={classNames("session-card__icon", "session-card__icon--columns")} />
      <div className="session-card__columns">
        <div className="session-card__columns-title">{t("Sessions.SessionsCard.column", {count: session.columns.length})}</div>
        <div className="session-card__columns-subtitle">
          {/* {session.columns */}
          {/*   .sort((a, b) => a.index - b.index) */}
          {/*   .map((c) => c.name) */}
          {/*   .join(", ")} */}
        </div>
      </div>
      <ColumnsIcon className={classNames("session-card__icon", "session-card__icon--age")} />
      <div className="session-card__age">
        <div className="session-card__columns-title">2 Weeks ago{/* TODO: {t("Templates.TemplateCard.column", {count: session.columns.length})} */}</div>
        <div className="session-card__columns-subtitle">
          {/* {session.columns */}
          {/*   .sort((a, b) => a.index - b.index) */}
          {/*   .map((c) => c.name) */}
          {/*   .join(", ")} */}
        </div>
      </div>
      <MultipleUserIcon className={classNames("session-card__icon", "session-card__icon--participants")} />
      <div className="session-card__participants">
        <div className="session-card__columns-title">10 Participants{/* TODO: {t("Templates.TemplateCard.column", {count: session.columns.length})} */}</div>
        <div className="session-card__columns-subtitle">
          {/* {session.columns */}
          {/*   .sort((a, b) => a.index - b.index) */}
          {/*   .map((c) => c.name) */}
          {/*   .join(", ")} */}
        </div>
      </div>
      <Button className={classNames("session-card__start-button", "session-card__start-button--start")} small icon={<NextIcon />} onClick={createBoard}>
        {t("Sessions.SessionsCard.goToSession")}
      </Button>

      {showConfirmationDialog && (
        <ConfirmationDialog
          title={t("ConfirmationDialog.deleteBoard")}
          onAccept={() => dispatch(deleteBoard())}
          onDecline={() => setShowConfirmationDialog(false)}
          icon={Trash}
          warning
        />
      )}
    </div>
  );
};
