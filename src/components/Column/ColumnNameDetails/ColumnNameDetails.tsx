import {Column} from "store/features";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import classNames from "classnames";
import {ReactComponent as ArrowIcon} from "assets/icons/arrow-down.svg";
import "./ColumnNameDetails.scss";

type ColumnNameDetailsProps = {
  column: Column;
  notesCount: number;
};

export const ColumnNameDetails = (props: ColumnNameDetailsProps) => {
  const {t} = useTranslation();

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <div className="column-name-details">
      <div className="column-name-details__name-wrapper">
        <div className="column-name-details__name">{props.column.name}</div>
        <div className="column-name-details__notes-count">{props.notesCount}</div>
      </div>
      {props.column.description ? (
        <div className="column-name-details__description-wrapper">
          <div className={classNames("column-name-details__description", {"column-name-details__description--expanded": isDescriptionExpanded})}>{props.column.description}</div>
          <button className={classNames("column-name-details__description-expand-icon-container")} onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}>
            <ArrowIcon
              className={classNames("column-name-details__description-expand-icon", {"column-name-details__description-extend-icon--expanded": isDescriptionExpanded})}
             />
          </button>
        </div>
      ) : (
        <div className="column-name-details__description--placeholder">{t("Column.Header.descriptionPlaceholder")}</div>
      )}
    </div>
  );
};
