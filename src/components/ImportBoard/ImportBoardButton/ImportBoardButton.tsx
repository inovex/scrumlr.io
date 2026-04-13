import {FileJsonIcon} from "components/Icon";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import "./ImportBoardButton.scss";
import {Tooltip} from "components/Tooltip";

type ImportBoardButtonProps = {
  className: string;
  onClick: () => void;
  allowImport: boolean;
};

// possible todo: try to integrate these styles into the general Button component
export const ImportBoardButton = (props: ImportBoardButtonProps) => {
  const {t} = useTranslation();

  return (
    <>
      <button
        id="import-board-button"
        className={classNames(props.className, "import-board-button")}
        onClick={props.onClick}
        disabled={!props.allowImport}
        title={!props.allowImport ? t("ImportBoard.importNotAllowedForAnonymousUsers") : t("ImportBoard.button")}
        tabIndex={0}
      >
        <div className="import-board-button__icon-container">
          <FileJsonIcon className="import-board-button__icon" />
        </div>
        <span className="import-board-button__label">{t("ImportBoard.button")}</span>
      </button>
      {!props.allowImport && <Tooltip anchorId="import-board-button">{t("ImportBoard.importNotAllowedForAnonymousUsers")}</Tooltip>}
    </>
  );
};
