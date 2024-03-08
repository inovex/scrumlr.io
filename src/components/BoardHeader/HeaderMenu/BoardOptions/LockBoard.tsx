import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";

export const LockBoard = () => {
  // const {t} = useTranslation();
  const allowEditing = useAppSelector((state) => state.board.data!.allowEditing);

  return (
    <BoardOption>
      <BoardOptionButton label="Allow changes" onClick={() => store.dispatch(Actions.editBoard({allowEditing: !allowEditing}))}>
        <BoardOptionToggle active={allowEditing} />
      </BoardOptionButton>
    </BoardOption>
  );
};
