import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";
import {setShowHiddenColumns} from "store/features";

export const ShowHiddenColumnsOption = () => {
  const {t} = useTranslation();
  const showHiddenColumns = useAppSelector((state) => !!state.participants?.self?.showHiddenColumns);
  const dispatch = useAppDispatch();

  return (
    <BoardOption data-testid="column">
      <BoardOptionButton
        label={t("BoardSettings.ShowHiddenColumnsOption")}
        onClick={() => {
          dispatch(setShowHiddenColumns({showHiddenColumns: !showHiddenColumns}));
        }}
      >
        <BoardOptionToggle active={showHiddenColumns} />
      </BoardOptionButton>
    </BoardOption>
  );
};
