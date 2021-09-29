import {useState} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import {ApplicationState} from "types/store";
import {useSelector} from "react-redux";
import QRCode from "qrcode.react";
import Portal from "components/Portal/Portal";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import classNames from "classnames";
import "./HeaderMenu.scss";

type HeaderMenuProps = {
  open: boolean;
  onClose: () => void;
};

const HeaderMenu = (props: HeaderMenuProps) => {
  const state = useSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data,
  }));
  const [boardName, setBoardName] = useState(state.board!.name);
  const [activeEditMode, setActiveEditMode] = useState(false);
  const [joinConfirmationRequired, setJoinConfirmationRequired] = useState(state.board!.joinConfirmationRequired);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!props.open) {
    return null;
  }

  const onSubmit = () => {
    if (activeEditMode && (state.board!.joinConfirmationRequired !== joinConfirmationRequired || state.board!.name !== boardName)) {
      store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: boardName, joinConfirmationRequired}));
    }
    setActiveEditMode(!activeEditMode);
  };

  return (
    <Portal
      onClose={() => {
        setActiveEditMode(false);
        setShowQrCode(false);
        setShowDelete(false);
        setBoardName(state.board!.name);
        setJoinConfirmationRequired(state.board!.joinConfirmationRequired);
        props.onClose();
      }}
      darkBackground={false}
    >
      <ul className="header-menu">
        <li className="header-menu__info">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          >
            <input
              className="info__board-name"
              value={boardName}
              disabled={!activeEditMode}
              onChange={(e) => setBoardName(e.target.value)}
              ref={(input) => {
                if (!input?.disabled) input?.focus();
              }}
              onFocus={(e) => e.target.select()}
            />
            <button type="button" className="info__access-mode" disabled={!activeEditMode} onClick={() => setJoinConfirmationRequired(!joinConfirmationRequired)}>
              <div className={classNames("info__access-mode-lock", {"info__access-mode-lock--unlocked": !joinConfirmationRequired})} />
              {joinConfirmationRequired ? "Private Session" : "Public Session"}
            </button>
            <button type="submit" className="info__edit-button">
              {activeEditMode ? "save" : "edit"}
            </button>
          </form>
        </li>
        <li className="header-menu__item">
          <button
            className="menu__item-button"
            onClick={() => {
              store.dispatch(ActionFactory.editBoard({id: state.board!.id, showAuthors: !state.board!.showAuthors, userConfiguration: {test: "Testetetet"}}));
            }}
          >
            <div className="item-button__toggle-container">
              <div
                className={classNames("item-button__toggle", {"item-button__toggle--left": state.board!.showAuthors}, {"item-button__toggle--right": !state.board!.showAuthors})}
              />
            </div>
            <label className="item-button__label">{state.board!.showAuthors ? "Hide" : "Show"} authors of card</label>
          </button>
        </li>
        <li className="header-menu__item">
          <button
            className="menu__item-button"
            onClick={() => {
              store.dispatch(ActionFactory.editBoard({id: state.board!.id, showNotesOfOtherUsers: !state.board!.showNotesOfOtherUsers}));
            }}
          >
            <div className="item-button__toggle-container">
              <div
                className={classNames(
                  "item-button__toggle",
                  {"item-button__toggle--left": state.board!.showNotesOfOtherUsers},
                  {"item-button__toggle--right": !state.board!.showNotesOfOtherUsers}
                )}
              />
            </div>
            <label className="item-button__label">{state.board!.showNotesOfOtherUsers ? "Hide" : "Show"} notes of other users</label>
          </button>
        </li>
        <li className="header-menu__item">
          <button
            className="menu__item-button"
            onClick={() => {
              setShowDelete(false);
              setShowQrCode(!showQrCode);
            }}
          >
            <ShareIcon className="item-button__icon" />
            <label className="item-button__label">Share board</label>
          </button>
        </li>
        <li className={classNames("header-menu__qrcode-container", {"header-menu__qrcode-container--visible": showQrCode})}>
          <QRCode value={document.location.href} size={260} className="qrcode-container__qrcode" />
          <button className="qrcode-container__copy-to-clipboard" onClick={() => navigator.clipboard.writeText(document.location.href)}>
            Copy Invite URL
          </button>
        </li>
        <li className="header-menu__item">
          <button
            className="menu__item-button"
            onClick={() => {
              setShowQrCode(false);
              setShowDelete(!showDelete);
            }}
          >
            <DeleteIcon className="item-button__icon" />
            <label className="item-button__label">Delete board</label>
          </button>
        </li>
        <li className={classNames("header-menu__delete-container", {"header-menu__delete-container--visible": showDelete})}>
          <label className="delete-container__warning-label">
            <b>Are you absolutely sure that you want to delete the board?</b> This action <b>cannot</b> be undone.
          </label>
          <button className="delete-container__delete-board" onClick={() => store.dispatch(ActionFactory.deleteBoard(state.board!.id))}>
            Delete board
          </button>
        </li>
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
