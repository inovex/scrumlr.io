import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";

export const ShowAllowEditingOption = () => {
  const {t} = useTranslation();
  const allowEditing = useAppSelector((state) => state.board.data?.allowEditing);
  const dispatch = useDispatch();

  return (
    <BoardOption data-testid="editing-board">
      <BoardOptionButton
        label={t("BoardSettings.AllowEditingOnBoardOption")}
        onClick={() => {
          dispatch(Actions.editBoard({allowEditing: !allowEditing}));
        }}
      >
        <BoardOptionToggle active={!!allowEditing} />
      </BoardOptionButton>
    </BoardOption>
  );
};
