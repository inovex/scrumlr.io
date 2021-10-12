import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "../BoardSettings/HeaderMenuItems.scss";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";

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
        <BoardOptionToggle active={state.board.showAuthors} />
      </BoardOptionButton>
    </BoardOption>
  );
};
