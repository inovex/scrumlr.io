import {useAppSelector} from "store";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {Actions} from "store/action";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";

export const ShowAuthorOption = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const showAuthors = useAppSelector((state) => state.board.data?.showAuthors);

  return (
    <BoardOption data-testid="author">
      <BoardOptionButton
        label={showAuthors ? t("ShowAuthorOption.hide") : t("ShowAuthorOption.show")}
        onClick={() => {
          dispatch(Actions.editBoard({showAuthors: !showAuthors}));
        }}
      >
        <BoardOptionToggle active={!!showAuthors} />
      </BoardOptionButton>
    </BoardOption>
  );
};
