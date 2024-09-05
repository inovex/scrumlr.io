import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";
import {editBoard} from "store/features";

export const ShowAuthorOption = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const showAuthors = useAppSelector((state) => state.board.data?.showAuthors);

  return (
    <BoardOption data-testid="author">
      <BoardOptionButton
        label={t("BoardSettings.ShowAuthorOption")}
        onClick={() => {
          dispatch(editBoard({showAuthors: !showAuthors}));
        }}
      >
        <BoardOptionToggle active={!!showAuthors} />
      </BoardOptionButton>
    </BoardOption>
  );
};
