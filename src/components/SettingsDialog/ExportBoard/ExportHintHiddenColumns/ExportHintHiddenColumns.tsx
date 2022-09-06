import {FC} from "react";
import {useTranslation} from "react-i18next";
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
        {t("ExportHint.hint")}
        <ul>
          {hiddenColumns.map((hiddenCol) => (
            <li>{hiddenCol.name}</li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};
