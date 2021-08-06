import {useState} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import "./HeaderMenu.scss";
import Portal from "components/Portal/Portal";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import classNames from "classnames";
import {ApplicationState} from "types/store";
import {useSelector} from "react-redux";

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
  if (!props.open) {
    return null;
  }

  return (
    <Portal
      onClose={() => {
        setActiveEditMode(false);
        setBoardName(state.board!.name);
        props.onClose();
      }}
      darkBackground={false}
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
                store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: boardName}));
              }
            }}
            ref={(input) => {
              if (!input?.disabled) {
                input?.focus();
              }
            }}
            onFocus={(e) => e.target.select()}
          />
          <button
            className="info__access-mode"
            disabled={!activeEditMode}
            onClick={() => store.dispatch(ActionFactory.editBoard({id: state.board!.id, joinConfirmationRequired: !state.board!.joinConfirmationRequired}))}
          >
            <div className={classNames("info__access-mode-lock", {"info__access-mode-lock--unlocked": !state.board!.joinConfirmationRequired})} />
            {state.board!.joinConfirmationRequired ? "Private Session" : "Public Session"}
          </button>
          <button
            className="info__edit-button"
            onClick={() => {
              setActiveEditMode(!activeEditMode);
              store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: boardName}));
            }}
          >
            {activeEditMode ? "save" : "edit"}
          </button>
        </li>
        <li className="header-menu__item">
          <button
            className="menu__item-button"
            onClick={() => {
              store.dispatch(ActionFactory.editBoard({id: state.board!.id, showAuthors: !state.board!.showAuthors}));
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
