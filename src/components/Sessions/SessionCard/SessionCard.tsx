import classNames from "classnames";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "components/Button";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import TextareaAutosize from "react-autosize-textarea";
import {FavouriteButton} from "components/Templates";
import {ReactComponent as MenuIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as ColumnsIcon} from "assets/icons/columns.svg";
import {ReactComponent as NextIcon} from "assets/icons/next.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {ReactComponent as TrashIcon} from "assets/icons/trash.svg";
import {ReactComponent as EditIcon} from "assets/icons/edit.svg";
import {ReactComponent as MultipleUserIcon} from "assets/icons/multiple-user.svg";
// import {ReactComponent as CalendarIcon} from "assets/icons/calendar-days.svg";
import "./SessionCard.scss";
import {useNavigate} from "react-router";
import {createBoardFromSession, deleteSession, Session} from "../../../store/features";
import {useAppDispatch} from "../../../store";

type SessionCardProps = {
  session: Session;
};

export const SessionCard = ({session}: SessionCardProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showMiniMenu, setShowMiniMenu] = useState(false);

  const closeMenu = () => {
    setShowMiniMenu(false);
  };

  const navigateToEdit = () => {
    // TODO
  };

  const deleteSessionInCard = () => {
    dispatch(deleteSession({id: session.id}));
  };

  const createBoard = () => {
    dispatch(createBoardFromSession(session))
      .unwrap()
      .then((boardId) => navigate(`/board/${boardId}`));
  };

  const renderMenu = () =>
    showMiniMenu ? (
      <MiniMenu
        className={classNames("template-card__menu", "template-card__menu--open")}
        items={[
          {label: "Delete", element: <TrashIcon />, onClick: deleteSessionInCard},
          {label: "Edit", element: <EditIcon />, onClick: navigateToEdit},
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
        <div className="session-card__columns-title">{t("Templates.TemplateCard.column", {count: session.columns.length})}</div>
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
        Go to Session{/* TODO: {t("Templates.TemplateCard.start")} */}
      </Button>
    </div>
  );
};
