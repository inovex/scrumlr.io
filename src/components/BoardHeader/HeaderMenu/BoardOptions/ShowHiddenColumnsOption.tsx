import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "../BoardSettings/BoardSettings.scss";
import Parse from "parse";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";

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
        <BoardOptionToggle active={Boolean(state.userConfiguration?.showHiddenColumns)} />
      </BoardOptionButton>
    </BoardOption>
  );
};
