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
  const [showAuthorNames, setShowAuthorNames] = useState(false);
  if (!props.open) {
    return null;
  }

  return (
    <Portal onClose={props.onClose} dark={false}>
      <ul className="header-menu">
        <li className="header-menu__info">
          <span className="info__board-name">{props.boardName}</span>
          <span className="info__access-mode">{props.accessMode}</span>
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
