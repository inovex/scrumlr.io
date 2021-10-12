import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "../BoardSettings/BoardSettings.scss";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";

export const ShowOtherUsersNotesOption = () => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <BoardOption data-testid="note">
      <BoardOptionButton
        label={`${state.board!.showNotesOfOtherUsers ? "Hide" : "Show"} notes of other users`}
        onClick={() => {
          store.dispatch(ActionFactory.editBoard({id: state.board!.id, showNotesOfOtherUsers: !state.board!.showNotesOfOtherUsers}));
        }}
      >
        <BoardOptionToggle active={state.board.showNotesOfOtherUsers} />
      </BoardOptionButton>
    </BoardOption>
  );
};
