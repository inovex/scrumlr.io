import {Toggle} from "components/Toggle";
import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {setShowBoardReactions} from "store/features";
import {SettingsButton} from "./SettingsButton";

export const BoardReactionsSettings = () => {
  const {t} = useTranslation();
  const showBoardReactions = useAppSelector((state) => state.view.showBoardReactions);
  const dispatch = useAppDispatch();

  return (
    <section>
      <SettingsButton
        aria-checked={showBoardReactions}
        label={t("Appearance.showBoardReactions")}
        onClick={() => dispatch(setShowBoardReactions(!showBoardReactions))}
        role="switch"
      >
        <Toggle active={showBoardReactions} />
      </SettingsButton>
    </section>
  );
};
