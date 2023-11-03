import {Toggle} from "components/Toggle";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {SettingsButton} from "./SettingsButton";

export const BoardReactionsSettings = () => {
  const {t} = useTranslation();
  const showBoardReactions = useAppSelector((state) => state.view.showBoardReactions);
  const dispatch = useDispatch();

  return (
    <section>
      <SettingsButton
        aria-checked={showBoardReactions}
        label={t("Appearance.showBoardReactions")}
        onClick={() => dispatch(Actions.setShowBoardReactions(!showBoardReactions))}
        role="switch"
      >
        <Toggle active={showBoardReactions} />
      </SettingsButton>
    </section>
  );
};
