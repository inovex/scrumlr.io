import {useAppSelector} from "store";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {Actions} from "store/action";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";

export const ShowOtherUsersNotesOption = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const showNotesOfOtherParticipants = useAppSelector((state) => state.board.data?.showNotesOfOtherUsers);

  return (
    <BoardOption data-testid="note">
      <BoardOptionButton
        label={t("BoardSettings.ShowOtherUsersNotesOption")}
        onClick={() => {
          dispatch(Actions.editBoard({showNotesOfOtherUsers: !showNotesOfOtherParticipants}));
        }}
      >
        <BoardOptionToggle active={!!showNotesOfOtherParticipants} />
      </BoardOptionButton>
    </BoardOption>
  );
};
