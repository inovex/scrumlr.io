import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "../BoardSettings/HeaderMenuItems.scss";
import classNames from "classnames";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";

export const ShowOtherUsersNotesOption = () => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <BoardOption data-testid="note">
      <BoardOptionButton
        onClick={() => {
          store.dispatch(ActionFactory.editBoard({id: state.board!.id, showNotesOfOtherUsers: !state.board!.showNotesOfOtherUsers}));
        }}
      >
        <div className="item-button__toggle-switch-container">
          <div
            className={classNames(
              "item-button__toggle-switch",
              {"item-button__toggle-switch--left": state.board!.showNotesOfOtherUsers},
              {"item-button__toggle-switch--right": !state.board!.showNotesOfOtherUsers}
            )}
          />
        </div>
        <label className="item-button__label">{state.board!.showNotesOfOtherUsers ? "Hide" : "Show"} notes of other users</label>
      </BoardOptionButton>
    </BoardOption>
  );
};
