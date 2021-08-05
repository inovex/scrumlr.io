import {useState} from "react";
import "./HeaderMenu.scss";
import Portal from "components/Portal/Portal";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import classNames from "classnames";

type HeaderMenuProps = {
  boardName: string;
  accessMode: string;
  open: boolean;
  onClose: () => void;
};

const HeaderMenu = (props: HeaderMenuProps) => {
  const [boardName, setBoardName] = useState(props.boardName);
  const [activeEditMode, setActiveEditMode] = useState(false);
  const [showAuthorNames, setShowAuthorNames] = useState(false);
  const [publicAccessMode, setPublicAccessMode] = useState(props.accessMode === "Public Session");
  if (!props.open) {
    return null;
  }

  return (
    <Portal
      onClose={() => {
        setActiveEditMode(false);
        props.onClose();
      }}
      dark={false}
    >
      <ul className="header-menu">
        <li className="header-menu__info">
          <input
            className="info__board-name"
            value={boardName}
            disabled={!activeEditMode}
            onChange={(e) => {
              setBoardName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setActiveEditMode(false);
              }
            }}
            ref={(input) => {
              if (!input?.disabled) {
                input?.focus();
              }
            }}
            onFocus={(e) => e.target.select()}
          />
          <button className="info__access-mode" disabled={!activeEditMode} onClick={() => setPublicAccessMode(!publicAccessMode)}>
            <div className={classNames("info__access-mode-lock", {"info__access-mode-lock--unlocked": publicAccessMode})} />
            {publicAccessMode ? "Public Session" : "Private Session"}
          </button>
          <button
            className="info__edit-button"
            onClick={() => {
              setActiveEditMode(!activeEditMode);
            }}
          >
            {activeEditMode ? "save" : "edit"}
          </button>
        </li>
        <li className="header-menu__item">
          <button className="menu__item-button" onClick={() => setShowAuthorNames(!showAuthorNames)}>
            <div className="item-button__toggle-container">
              <div className={classNames("item-button__toggle", {"item-button__toggle--left": showAuthorNames}, {"item-button__toggle--right": !showAuthorNames})} />
            </div>
            <label className="item-button__label">{showAuthorNames ? "Hide" : "Show"} authors of card</label>
          </button>
        </li>
        <li className="header-menu__item">
          <button className="menu__item-button">
            <ShareIcon className="item-button__icon" />
            <label className="item-button__label">Share board</label>
          </button>
        </li>
        <li className="header-menu__item">
          <button className="menu__item-button">
            <DeleteIcon className="item-button__icon" />
            <label className="item-button__label">Delete board</label>
          </button>
        </li>
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
