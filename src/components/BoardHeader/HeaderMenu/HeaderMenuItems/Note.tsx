import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "./HeaderMenuItems.scss";
import classNames from "classnames";

export const Note = () => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <div className="header-menu__item-button" data-testid="note">
      <li className="header-menu__item">
        <button
          className="header-menu__item-button"
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
        </button>
      </li>
    </div>
  );
};
