import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "./HeaderMenuItems.scss";
import classNames from "classnames";

export type ColumnProps = {};

export const Columns = (props: ColumnProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <div className="menu__item-button">
      <li className="header-menu__item">
        <button
          className="menu__item-button"
          onClick={() => {
            if (state.user?.id) {
              store.dispatch(ActionFactory.editUserConfiguration({showHiddenColumns: !state.userConfiguration?.showHiddenColumns}));
            }
          }}
        >
          <div className="item-button__toggle-container">
            <div
              className={classNames(
                "item-button__toggle",
                {"item-button__toggle--left": state.userConfiguration?.showHiddenColumns},
                {"item-button__toggle--right": !state.userConfiguration?.showHiddenColumns}
              )}
            />
          </div>
          <label className="item-button__label">{state.userConfiguration?.showHiddenColumns ? "Hide" : "Show"} columns</label>
        </button>
      </li>
    </div>
  );
};
