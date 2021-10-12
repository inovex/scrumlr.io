import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "../BoardSettings/HeaderMenuItems.scss";
import classNames from "classnames";
import Parse from "parse";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";

export const ShowHiddenColumnsOption = () => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
    user: applicationState.users.all.find((user) => user.id === Parse.User.current()!.id),
    userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
  }));

  return (
    <BoardOption>
      <BoardOptionButton
        label={`${state.userConfiguration?.showHiddenColumns ? "Hide" : "Show"} columns`}
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
      </BoardOptionButton>
    </BoardOption>
  );
};
