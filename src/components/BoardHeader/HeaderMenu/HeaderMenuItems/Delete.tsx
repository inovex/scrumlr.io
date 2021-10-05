import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {Dispatch, SetStateAction} from "react";
import "./HeaderMenuItems.scss";
import classNames from "classnames";

export type DeleteProps = {
  setShowDelete: Dispatch<SetStateAction<boolean>>;
  setShowQrCode: Dispatch<SetStateAction<boolean>>;
  setShowExport: Dispatch<SetStateAction<boolean>>;
  showDelete: boolean;
};

export const Delete = (props: DeleteProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <div className="menu__item-button">
      <li className="header-menu__item">
        <button
          className="menu__item-button"
          onClick={() => {
            props.setShowQrCode(false);
            props.setShowExport(false);
            props.setShowDelete(!props.showDelete);
          }}
        >
          <DeleteIcon className="item-button__icon" />
          <label className="item-button__label">Delete board</label>
        </button>
      </li>
      <li className={classNames("header-menu__delete-container", {"header-menu__delete-container--visible": props.showDelete})}>
        <label className="delete-container__warning-label">
          <b>Are you absolutely sure that you want to delete the board?</b> This action <b>cannot</b> be undone.
        </label>
        <button className="delete-container__delete-board" onClick={() => store.dispatch(ActionFactory.deleteBoard(state.board!.id))}>
          Delete board
        </button>
      </li>
    </div>
  );
};
