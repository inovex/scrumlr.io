import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {Dispatch, SetStateAction} from "react";
import "../BoardSettings/BoardSettings.scss";
import classNames from "classnames";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import "./DeleteBoardOption.scss";

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
      <BoardOptionButton
        label="Delete board"
        icon={DeleteIcon}
        isExpandable
        onClick={() => {
          props.setShowQrCode(false);
          props.setShowExport(false);
          props.setShowDelete(!props.showDelete);
        }}
      />
      <div className={classNames("delete-board-option__container", {"delete-board-option__container--visible": props.showDelete})}>
        <label className="delete-board-option__warning-label">
          <b>Are you absolutely sure that you want to delete the board?</b> This action <b>cannot</b> be undone.
        </label>
        <button className="delete-board-option__delete-board" onClick={() => store.dispatch(ActionFactory.deleteBoard(state.board!.id))}>
          Delete board
        </button>
      </div>
    </BoardOption>
  );
};
