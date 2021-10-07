import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "./HeaderMenuItems.scss";
import classNames from "classnames";
import Parse from "parse";

export type ColumnProps = {};

export const Columns = (props: ColumnProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
    user: applicationState.users.all.find((user) => user.id === Parse.User.current()!.id),
    userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
  }));

  return (
    <div className="menu__item-button" id="columns">
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
