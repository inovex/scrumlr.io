import {FileJsonIcon} from "components/Icon";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import "./ImportBoardButton.scss";

type ImportBoardButtonProps = {
  className: string;
  onClick: () => void;
  disabled: boolean;
};

// possible todo: try to integrate these styles into the general Button component
export const ImportBoardButton = (props: ImportBoardButtonProps) => {
  const {t} = useTranslation();

  return (
    <button
      className={classNames(props.className, "import-board-button")}
      onClick={props.onClick}
      disabled={props.disabled}
      title={!props.disabled ? t("Templates.TemplateCard.signInToCreateBoards") : ""}
      tabIndex={0}
    >
      <div className="import-board-button__icon-container">
        <FileJsonIcon className="import-board-button__icon" />
      </div>
      <span className="import-board-button__label">{t("ImportBoard.button")}</span>
    </button>
  );
};
