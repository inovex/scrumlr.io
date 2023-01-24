import {FC} from "react";
import {useTranslation} from "react-i18next";
import {ReactComponent as InfoIcon} from "assets/icon-warning.svg";
import {Column} from "../../../../types/column";
import "./ExportHintHiddenColumns.scss";

export interface ExportHintHiddenColumnsProps {
  columns: Column[];
}

export const ExportHintHiddenColumns: FC<ExportHintHiddenColumnsProps> = ({columns}) => {
  const hiddenColumns = columns.filter((col) => !col.visible);
  const {t} = useTranslation();

  if (hiddenColumns.length) {
    return (
      <div className="hint-hidden-columns__grid-container">
        <InfoIcon className="hint-hidden-columns__info-icon" />
        <span className="hint-hidden-columns__info-text">{t("ExportBoardOption.hintHiddenColumns")}</span>
        <div className="hint-hidden-columns__columns-list-container">
          <ul className="hint-hidden-columns__columns-list">
            {hiddenColumns.map((hiddenCol) => (
              <li key={hiddenCol.id}>{hiddenCol.name}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return null;
};
