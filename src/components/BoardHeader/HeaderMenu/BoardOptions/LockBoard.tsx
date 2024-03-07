import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";
import {useAppSelector} from "store";

export const LockBoard = () => {
  // const {t} = useTranslation();
  const allowEditing = useAppSelector((state) => state.board.data!.allowEditing);

  return (
    <BoardOption>
      <BoardOptionButton label="Allow changes" onClick={() => {}}>
        <BoardOptionToggle active={allowEditing} />
      </BoardOptionButton>
    </BoardOption>
  );
};
