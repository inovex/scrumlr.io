import {Column} from "store/features";
import {useTranslation} from "react-i18next";
import {useState, ChangeEvent} from "react";
import classNames from "classnames";
import {ReactComponent as ArrowIcon} from "assets/icons/arrow-down.svg";
import {ReactComponent as SettingsIcon} from "assets/icons/three-dots.svg";
import {useTextOverflow} from "utils/hooks/useTextOverflow";
import {ColumnSettings} from "components/Column/ColumnSettings";
import "components/Column/ColumnDetails/ColumnDetails.scss";
import {TextArea} from "components/TextArea/TextArea";

export type ColumnDetailsMode = "view" | "edit";

type ColumnDetailsProps = {
  column: Column;
  notesCount: number;
  mode: ColumnDetailsMode;
  changeMode: (mode: ColumnDetailsMode) => void;
};

export const ColumnDetails = (props: ColumnDetailsProps) => {
  const {t} = useTranslation();

  const {isTextTruncated, textRef: descriptionRef} = useTextOverflow<HTMLDivElement>(props.column.description);

  const [openSettings, setOpenSettings] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [localName, setLocalName] = useState(props.column.name);
  const [localDescription, setLocalDescription] = useState(props.column.description);

  const renderName = () =>
    props.mode === "view" ? (
      <>
        <div className="column-details__name">{props.column.name}</div>
        <div className="column-details__notes-count">{props.notesCount}</div>
      </>
    ) : (
      <input className={classNames("column-details__name", "column-details__name--editing")} value={localName} onInput={(e) => setLocalName(e.currentTarget.value)} />
    );

  const renderDescription = () =>
    props.mode === "view" ? (
      props.column.description ? (
        <>
          <div ref={descriptionRef} className={classNames("column-details__description", {"column-details__description--expanded": isDescriptionExpanded})}>
            {props.column.description}
          </div>
          {isTextTruncated.vertical && (
            <button className={classNames("column-details__description-expand-icon-container")} onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}>
              <ArrowIcon className={classNames("column-details__description-expand-icon", {"column-details__description-expand-icon--expanded": isDescriptionExpanded})} />
            </button>
          )}
        </>
      ) : (
        <div className="column-details__description--placeholder">{t("Column.Header.descriptionPlaceholder")}</div>
      )
    ) : (
      <TextArea className="column-configurator-column-name-details__description-text-area" input={localDescription} setInput={setLocalDescription} embedded />
    );

  return (
    <div className="column-details">
      <div className="column-details__name-and-settings-wrapper">
        <div className="column-details__name-wrapper">{renderName()}</div>
        {openSettings ? (
          <ColumnSettings
            className={classNames("column-details__settings", "column-details__settings--open")}
            column={props.column}
            onClose={() => setOpenSettings(false)}
            onNameEdit={() => props.changeMode("edit")}
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
      <div className="column-details__description-wrapper">{renderDescription()}</div>
    </div>
  );
};
