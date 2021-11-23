import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "../BoardSettings/BoardSettings.scss";
import {useTranslation} from "react-i18next";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";

export var ShowOtherUsersNotesOption = function() {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <BoardOption data-testid="note">
      <BoardOptionButton
        label={state.board!.showNotesOfOtherUsers ? t("ShowOtherUsersNotesOption.hide") : t("ShowOtherUsersNotesOption.show")}
        onClick={() => {
          store.dispatch(ActionFactory.editBoard({id: state.board!.id, showNotesOfOtherUsers: !state.board!.showNotesOfOtherUsers}));
        }}
      >
        <BoardOptionToggle active={state.board.showNotesOfOtherUsers} />
      </BoardOptionButton>
    </BoardOption>
  );
}
