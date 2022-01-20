import classNames from "classnames";
import {VFC} from "react";
import {useTranslation} from "react-i18next";
import {ReactComponent as ExportCSV} from "assets/icon-export-csv.svg";
import {ReactComponent as ExportJSON} from "assets/icon-export-json.svg";
import {useAppSelector} from "../../../store";
import {ApplicationState} from "../../../types/store";
import {exportAsJSON, exportAsCSV} from "../../../utils/export";
import {SettingsButton} from "../Components/SettingsButton";
import "../SettingsDialog.scss";

export const ExportBoard: VFC = () => {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
    notes: applicationState.notes,
    users: applicationState.users,
    votes: applicationState.votes,
  }));

  return (
    <div data-testid="export" className="settings-dialog__container">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__backlog-blue")}> {t("ExportBoardOption.title")}</h2>
      </div>

      <div className={classNames("settings-dialog__group", "accent-color__backlog-blue")}>
        <SettingsButton
          label={t("ExportBoardOption.exportAsJson")}
          icon={ExportJSON}
          onClick={() => {
            exportAsJSON(state);
          }}
          data-testid="export-json"
        />
        <hr className="settings-dialog__seperator" />
        <SettingsButton
          label={t("ExportBoardOption.exportAsCSV")}
          icon={ExportCSV}
          onClick={() => {
            exportAsCSV(state);
          }}
          data-testid="export-csv"
        />
      </div>
    </div>
  );
};
