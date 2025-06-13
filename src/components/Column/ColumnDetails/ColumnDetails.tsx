import {Column, editColumn} from "store/features";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import classNames from "classnames";
import {ReactComponent as ArrowIcon} from "assets/icons/arrow-down.svg";
import {ReactComponent as SettingsIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as CheckDoneIcon} from "assets/icons/check-done.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {useTextOverflow} from "utils/hooks/useTextOverflow";
import {ColumnSettings} from "components/Column/ColumnSettings";
import "components/Column/ColumnDetails/ColumnDetails.scss";
import {TextArea} from "components/TextArea/TextArea";
import {MiniMenu, MiniMenuItem} from "components/MiniMenu/MiniMenu";
import {useAppDispatch} from "store";

export type ColumnDetailsMode = "view" | "edit";

type ColumnDetailsProps = {
  column: Column;
  notesCount: number;
  mode: ColumnDetailsMode;
  changeMode: (mode: ColumnDetailsMode) => void;
};

export const ColumnDetails = (props: ColumnDetailsProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const {isTextTruncated, textRef: descriptionRef} = useTextOverflow<HTMLDivElement>(props.column.description);

  const [openSettings, setOpenSettings] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [localName, setLocalName] = useState(props.column.name);
  const [localDescription, setLocalDescription] = useState(props.column.description);

  const updateColumnDetails = (newName: string, newDescription: string) =>
    dispatch(editColumn({id: props.column.id, column: {...props.column, name: newName, description: newDescription}}));

  const descriptionConfirmMiniMenu: MiniMenuItem[] = [
    {
      className: "mini-menu-item--cancel",
      element: <CloseIcon />,
      label: "Cancel",
      onClick(): void {
        // reset
        setLocalName(props.column.name);
        setLocalDescription(props.column.description);
        props.changeMode("view");
      },
    },
    {
      className: "mini-menu-item--save",
      element: <CheckDoneIcon />,
      label: "Save",
      onClick(): void {
        updateColumnDetails(localName, localDescription);
        props.changeMode("view");
      },
    },
  ];

  const renderName = () =>
    props.mode === "view" ? (
      <>
        <div className="column-details__name">{props.column.name}</div>
        <div className="column-details__notes-count">{props.notesCount}</div>
      </>
    ) : (
      <input className={classNames("column-details__name", "column-details__name--editing")} value={localName} onInput={(e) => setLocalName(e.currentTarget.value)} />
    );

  const viewableDescription = props.column.description ? (
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
  );

  const editableDescription = (
    <>
      <TextArea className="column-details__description-text-area" input={localDescription} setInput={setLocalDescription} embedded />
      <MiniMenu className="column-details__description-mini-menu" items={descriptionConfirmMiniMenu} small transparent />
    </>
  );

  const renderDescription = () => (props.mode === "view" ? viewableDescription : editableDescription);

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
      <div className={classNames("column-details__description-wrapper", `column-details__description-wrapper--${props.mode}`)}>{renderDescription()}</div>
    </div>
  );
};
