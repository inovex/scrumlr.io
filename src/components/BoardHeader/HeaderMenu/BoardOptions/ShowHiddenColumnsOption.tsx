import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";

export const ShowHiddenColumnsOption = () => {
  const {t} = useTranslation();
  const showHiddenColumns = useAppSelector((state) => state.participants?.self.showHiddenColumns);
  const dispatch = useDispatch();

  return (
    <BoardOption data-testid="column">
      <BoardOptionButton
        label={t("BoardSettings.ShowHiddenColumnsOption")}
        onClick={() => {
          dispatch(Actions.setShowHiddenColumns(!showHiddenColumns));
        }}
      >
        <BoardOptionToggle active={!!showHiddenColumns} />
      </BoardOptionButton>
    </BoardOption>
  );
};
