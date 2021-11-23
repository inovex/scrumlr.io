import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "../BoardSettings/BoardSettings.scss";
import {useTranslation} from "react-i18next";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";

export var ShowAuthorOption = function() {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <BoardOption data-testid="author">
      <BoardOptionButton
        label={state.board!.showAuthors ? t("ShowAuthorOption.hide") : t("ShowAuthorOption.show")}
        onClick={() => {
          store.dispatch(ActionFactory.editBoard({id: state.board!.id, showAuthors: !state.board!.showAuthors}));
        }}
      >
        <BoardOptionToggle active={state.board.showAuthors} />
      </BoardOptionButton>
    </BoardOption>
  );
}
