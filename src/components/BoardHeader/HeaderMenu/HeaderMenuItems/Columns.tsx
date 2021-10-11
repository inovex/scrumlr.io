import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "./HeaderMenuItems.scss";
import classNames from "classnames";
import Parse from "parse";

export const Columns = () => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
    user: applicationState.users.all.find((user) => user.id === Parse.User.current()!.id),
    userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
  }));

  return (
    <div className="header-menu__item-button" data-testid="columns">
      <li className="header-menu__item">
        <button
          className="header-menu__item-button"
          onClick={() => {
              store.dispatch(ActionFactory.editUserConfiguration({showHiddenColumns: !state.userConfiguration?.showHiddenColumns}));
          }}
        >
          <div className="item-button__toggle-switch-container">
            <div
              className={classNames(
                "item-button__toggle-switch",
                {"item-button__toggle-switch--left": state.userConfiguration?.showHiddenColumns},
                {"item-button__toggle-switch--right": !state.userConfiguration?.showHiddenColumns}
              )}
            />
          </div>
          <label className="item-button__label">{state.userConfiguration?.showHiddenColumns ? "Hide" : "Show"} columns</label>
        </button>
      </li>
    </div>
  );
};
