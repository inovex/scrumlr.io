import {useAppSelector} from "store";
import {ApplicationState} from "types";
import {Actions} from "store/action";
import "../BoardSettings/BoardSettings.scss";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";

export const ShowHiddenColumnsOption = () => {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    user: applicationState.participants!.self,
  }));
  const dispatch = useDispatch();

  return (
    <BoardOption data-testid="column">
      <BoardOptionButton
        label={state.user.showHiddenColumns ? t("ShowHiddenColumnsOption.hide") : t("ShowHiddenColumnsOption.show")}
        onClick={() => {
          dispatch(Actions.setShowHiddenColumns(!state.user.showHiddenColumns));
        }}
      >
        <BoardOptionToggle active={Boolean(state.user.showHiddenColumns)} />
      </BoardOptionButton>
    </BoardOption>
  );
};
