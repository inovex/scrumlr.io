import {Column} from "store/features";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import classNames from "classnames";
import {ReactComponent as ArrowIcon} from "assets/icons/arrow-down.svg";
import {ReactComponent as SettingsIcon} from "assets/icons/three-dots.svg";
import {useTextOverflow} from "utils/hooks/useTextOverflow";
import {ColumnSettings} from "components/Column/ColumnSettings";
import "components/Column/ColumnDetails/ColumnDetails.scss";

type ColumnDetailsProps = {
  column: Column;
  notesCount: number;
};

export const ColumnDetails = (props: ColumnDetailsProps) => {
  const {t} = useTranslation();

  const {isTextTruncated, textRef: descriptionRef} = useTextOverflow<HTMLDivElement>(props.column.description);

  const [openSettings, setOpenSettings] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const onNameEdit = () => {};

  return (
    <div className="column-details">
      <div className="column-details__name-and-settings-wrapper">
        <div className="column-details__name-wrapper">
          <div className="column-details__name">{props.column.name}</div>
          <div className="column-details__notes-count">{props.notesCount}</div>
        </div>
        {openSettings ? (
          <ColumnSettings
            className={classNames("column-details__settings", "column-details__settings--open")}
            column={props.column}
            onClose={() => setOpenSettings(false)}
            onNameEdit={onNameEdit}
          />
        ) : (
          <button
            className={classNames("column-details__settings", "column-details__settings--closed", "column-details__settings-icon-container")}
            onClick={() => setOpenSettings(true)}
          >
            <SettingsIcon className="column-details__settings-icon" />
          </button>
        )}
      </div>
      {props.column.description ? (
        <div className="column-details__description-wrapper">
          <div ref={descriptionRef} className={classNames("column-details__description", {"column-details__description--expanded": isDescriptionExpanded})}>
            {props.column.description}
          </div>
          {isTextTruncated.vertical && (
            <button className={classNames("column-details__description-expand-icon-container")} onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}>
              <ArrowIcon className={classNames("column-details__description-expand-icon", {"column-details__description-expand-icon--expanded": isDescriptionExpanded})} />
            </button>
          )}
        </div>
      ) : (
        <div className="column-details__description--placeholder">{t("Column.Header.descriptionPlaceholder")}</div>
      )}
    </div>
  );
};
