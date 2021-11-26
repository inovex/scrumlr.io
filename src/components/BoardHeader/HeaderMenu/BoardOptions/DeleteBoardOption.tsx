import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import "../BoardSettings/BoardSettings.scss";
import classNames from "classnames";
import {TabIndex} from "constants/tabIndex";
import {useTranslation} from "react-i18next";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import "./DeleteBoardOption.scss";

export type DeleteProps = {
  onClick: () => void;
  expand: boolean;
};

export var DeleteBoardOption = function (props: DeleteProps) {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <BoardOption data-testid="delete">
      <BoardOptionButton label={t("DeleteBoardOption.button")} icon={DeleteIcon} isExpandable onClick={props.onClick} />
      <div className={classNames("delete-board-option__container", {"delete-board-option__container--visible": props.expand})}>
        <label className="delete-board-option__warning-label">{t("DeleteBoardOption.warning")}</label>
        <button
          className="delete-board-option__delete-board"
          onClick={() => store.dispatch(ActionFactory.deleteBoard(state.board!.id))}
          tabIndex={props.expand ? TabIndex.default : TabIndex.disabled}
        >
          {t("DeleteBoardOption.button")}
        </button>
      </div>
    </BoardOption>
  );
};
