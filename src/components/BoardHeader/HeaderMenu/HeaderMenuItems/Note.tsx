import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "./HeaderMenuItems.scss";
import classNames from "classnames";

export type NoteProps = {};

export const Note = (props: NoteProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <div className="menu__item-button" id="note">
      <li className="header-menu__item">
        <button
          className="menu__item-button"
          onClick={() => {
            store.dispatch(ActionFactory.editBoard({id: state.board!.id, showNotesOfOtherUsers: !state.board!.showNotesOfOtherUsers}));
          }}
        >
          <div className="item-button__toggle-container">
            <div
              className={classNames(
                "item-button__toggle",
                {"item-button__toggle--left": state.board!.showNotesOfOtherUsers},
                {"item-button__toggle--right": !state.board!.showNotesOfOtherUsers}
              )}
            />
          </div>
          <label className="item-button__label">{state.board!.showNotesOfOtherUsers ? "Hide" : "Show"} notes of other users</label>
        </button>
      </li>
    </div>
  );
};
