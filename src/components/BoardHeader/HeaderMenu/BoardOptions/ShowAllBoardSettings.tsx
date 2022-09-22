import {useTranslation} from "react-i18next";
import {BoardOption} from "./BoardOption";
import {BoardOptionLink} from "./BoardOptionLink";

type ShowAllBoardSettingsProps = {
  onClose?: () => void;
};

export const ShowAllBoardSettings = (props: ShowAllBoardSettingsProps) => {
  const {t} = useTranslation();
  return (
    <BoardOption data-testid="allSettings">
      <BoardOptionLink to="settings" label={t("BoardHeader.showAllBoardSettings")} onClick={props.onClose} />
    </BoardOption>
  );
};
