import {FC} from "react";
import {useTranslation} from "react-i18next";
import {ReactComponent as InfoIcon} from "assets/icon-warning.svg";
import {Column} from "../../../../types/column";
import "./ExportHintHiddenColumns.scss";

export interface ExportHintHiddenColumnsProps {
  columns: Column[];
  className: string;
}

export const ExportHintHiddenColumns: FC<ExportHintHiddenColumnsProps> = ({columns, className}) => {
  const hiddenColumns = columns.filter((col) => !col.visible);
  const {t} = useTranslation();

  if (hiddenColumns.length > 0) {
    return (
      <div className={className}>
        <div className="hint-hidden-columns__info-container">
          <InfoIcon className="hint-hidden-columns__info-icon" />
          <span className="hint-hidden-columns__info-text">{t("ExportBoardOption.hintHiddenColumns")}</span>
        </div>
        <div>
          <ul className="hint-hidden-columns__columns-list">
            {hiddenColumns.map((hiddenCol) => (
              <li>{hiddenCol.name}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return null;
};
