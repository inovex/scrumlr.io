import {useAppDispatch, useAppSelector} from "store";
import {editBoard} from "store/features";
import {useTranslation} from "react-i18next";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";

export const ShowOtherUsersNotesOption = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const showNotesOfOtherParticipants = useAppSelector((state) => state.board.data?.showNotesOfOtherUsers);

  return (
    <BoardOption data-testid="note">
      <BoardOptionButton
        label={t("BoardSettings.ShowOtherUsersNotesOption")}
        onClick={() => {
          dispatch(editBoard({showNotesOfOtherUsers: !showNotesOfOtherParticipants}));
        }}
      >
        <BoardOptionToggle active={!!showNotesOfOtherParticipants} />
      </BoardOptionButton>
    </BoardOption>
  );
};
