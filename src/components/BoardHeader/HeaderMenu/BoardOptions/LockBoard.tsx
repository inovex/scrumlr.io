import store, {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {Actions} from "store/action";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";

export const LockBoard = () => {
  const {t} = useTranslation();
  const allowEditing = useAppSelector((state) => state.board.data!.isLocked);

  return (
    <BoardOption>
      <BoardOptionButton
        aria-checked={allowEditing}
        role="switch"
        label={t("BoardSettings.AllowEditing")}
        onClick={() => store.dispatch(Actions.editBoard({isLocked: !allowEditing}))}
      >
        <BoardOptionToggle active={allowEditing} />
      </BoardOptionButton>
    </BoardOption>
  );
};
