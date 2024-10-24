import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {editBoard} from "store/features";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";

export const LockBoard = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const isLocked = useAppSelector((state) => state.board.data!.isLocked);

  return (
    <BoardOption>
      <BoardOptionButton aria-checked={isLocked} role="switch" label={t("BoardSettings.IsLocked")} onClick={() => dispatch(editBoard({isLocked: !isLocked}))}>
        <BoardOptionToggle active={isLocked} />
      </BoardOptionButton>
    </BoardOption>
  );
};
