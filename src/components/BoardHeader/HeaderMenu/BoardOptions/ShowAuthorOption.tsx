import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "../BoardSettings/HeaderMenuItems.scss";
import classNames from "classnames";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";

export const ShowAuthorOption = () => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <BoardOption data-testid="author">
      <BoardOptionButton
        label={`${state.board!.showAuthors ? "Hide" : "Show"} authors of card`}
        onClick={() => {
          store.dispatch(ActionFactory.editBoard({id: state.board!.id, showAuthors: !state.board!.showAuthors}));
        }}
      >
        <div className="item-button__toggle-switch-container">
          <div
            className={classNames(
              "item-button__toggle-switch",
              {"item-button__toggle-switch--left": state.board!.showAuthors},
              {"item-button__toggle-switch--right": !state.board!.showAuthors}
            )}
          />
        </div>
      </BoardOptionButton>
    </BoardOption>
  );
};
