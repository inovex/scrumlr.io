import store, {useAppSelector} from "store";
import {ApplicationState} from "types";
import {ActionFactory} from "store/action";
import "../BoardSettings/BoardSettings.scss";
import {useTranslation} from "react-i18next";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";

export const ShowHiddenColumnsOption = () => {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
    user: applicationState.participants.participants.find((user) => user.id === Parse.User.current()!.id),
    userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
  }));

  return (
    <BoardOption data-testid="column">
      <BoardOptionButton
        label={state.userConfiguration?.showHiddenColumns ? t("ShowHiddenColumnsOption.hide") : t("ShowHiddenColumnsOption.show")}
        onClick={() => {
          store.dispatch(ActionFactory.editUserConfiguration({showHiddenColumns: !state.userConfiguration?.showHiddenColumns}));
        }}
      >
        <BoardOptionToggle active={Boolean(state.userConfiguration?.showHiddenColumns)} />
      </BoardOptionButton>
    </BoardOption>
  );
};
