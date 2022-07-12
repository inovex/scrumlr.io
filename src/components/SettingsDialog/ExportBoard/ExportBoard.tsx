import classNames from "classnames";
import {VFC} from "react";
import {useTranslation} from "react-i18next";
import {ReactComponent as ExportCSV} from "assets/icon-export-csv.svg";
import {ReactComponent as ExportJSON} from "assets/icon-export-json.svg";
import {ReactComponent as PrintIcon} from "assets/icon-print.svg";
import {useNavigate} from "react-router";
import {useAppSelector} from "../../../store";
import {exportAsJSON, exportAsCSV} from "../../../utils/export";
import {SettingsButton} from "../Components/SettingsButton";
import "./ExportBoard.scss";
import "../SettingsDialog.scss";

export const ExportBoard: VFC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const boardId = useAppSelector((state) => state.board.data!.id);
  const boardName = useAppSelector((state) => state.board.data!.name);

  return (
    <div data-testid="export" className="settings-dialog__container">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__backlog-blue")}> {t("ExportBoardOption.title")}</h2>
      </div>

      <div className={classNames("settings-dialog__group", "accent-color__backlog-blue")}>
        <SettingsButton
          label={t("ExportBoardOption.exportAsJson")}
          icon={ExportJSON}
          className="export-board__button-reverse-order"
          onClick={() => {
            exportAsJSON(boardId, boardName);
          }}
          data-testid="export-json"
        />
        <hr className="settings-dialog__separator" />
        <SettingsButton
          label={t("ExportBoardOption.exportAsCSV")}
          icon={ExportCSV}
          className="export-board__button-reverse-order"
          onClick={() => {
            exportAsCSV(boardId, boardName);
          }}
          data-testid="export-csv"
        />
        <hr className="settings-dialog__separator" />
        <SettingsButton
          label={t("ExportBoardOption.openPrintView")}
          icon={PrintIcon}
          className="export-board__button-reverse-order"
          onClick={() => {
            navigate(`/board/${boardId}/print`);
          }}
        />
      </div>
    </div>
  );
};
