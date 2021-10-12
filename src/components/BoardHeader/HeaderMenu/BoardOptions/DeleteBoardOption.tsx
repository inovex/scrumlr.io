import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {Dispatch, SetStateAction} from "react";
import "../BoardSettings/HeaderMenuItems.scss";
import classNames from "classnames";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";

export type DeleteProps = {
  setShowDelete: Dispatch<SetStateAction<boolean>>;
  setShowQrCode: Dispatch<SetStateAction<boolean>>;
  setShowExport: Dispatch<SetStateAction<boolean>>;
  showDelete: boolean;
};

export const DeleteBoardOption = (props: DeleteProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <BoardOption data-testid="delete">
      <li className="header-menu__item">
        <BoardOptionButton
          label="Delete board"
          icon={DeleteIcon}
          onClick={() => {
            props.setShowQrCode(false);
            props.setShowExport(false);
            props.setShowDelete(!props.showDelete);
          }}
        />
      </li>
      <li className={classNames("header-menu__delete-container", {"header-menu__delete-container--visible": props.showDelete})}>
        <label className="delete-container__warning-label">
          <b>Are you absolutely sure that you want to delete the board?</b> This action <b>cannot</b> be undone.
        </label>
        <button className="delete-container__delete-board" onClick={() => store.dispatch(ActionFactory.deleteBoard(state.board!.id))}>
          Delete board
        </button>
      </li>
    </BoardOption>
  );
};
