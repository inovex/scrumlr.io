import {Column, createColumn, deleteColumnOptimistically, editColumn} from "store/features";
import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
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
import {useOnBlur} from "utils/hooks/useOnBlur";

export type ColumnDetailsMode = "view" | "edit";

type ColumnDetailsProps = {
  column: Column;
  notesCount: number;
  mode: ColumnDetailsMode;
  changeMode: (mode: ColumnDetailsMode) => void;
  isTemporary: boolean;
};

export const ColumnDetails = (props: ColumnDetailsProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement>(null);

  const {isTextTruncated, textRef: descriptionRef} = useTextOverflow<HTMLDivElement>(props.column.description);

  const [openSettings, setOpenSettings] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [localName, setLocalName] = useState(props.column.name);
  const [localDescription, setLocalDescription] = useState(props.column.description);

  const hasNameInputContent = localName.trim().length > 0;

  // focus input upon entering edit mode
  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, props.mode]);

  const cancelUpdate = () => {
    if (props.isTemporary) {
      dispatch(deleteColumnOptimistically(props.column.id));
    } else {
      setLocalName(props.column.name);
      setLocalDescription(props.column.description);
    }
  };

  // if column exists, update details
  // else create new column
  const updateColumnDetails = (newName: string, newDescription: string) => {
    if (!hasNameInputContent) {
      cancelUpdate();
      return;
    }

    const updateColumnPayload: Column = {...props.column, name: newName, description: newDescription};
    if (props.isTemporary) {
      dispatch(createColumn(updateColumnPayload));
    } else {
      dispatch(editColumn({id: props.column.id, column: updateColumnPayload}));
    }

    props.changeMode("view");
  };

  const handleBlur = () => {
    if (props.mode === "view") return;

    // behaviour: always save as long as name is not empty.
    // could also change it to only save if persisted is empty.
    updateColumnDetails(localName, localDescription);
  };

  const ref = useOnBlur<HTMLDivElement>(handleBlur);

  const descriptionConfirmMiniMenu: MiniMenuItem[] = [
    {
      className: "mini-menu-item--cancel",
      element: <CloseIcon />,
      label: "Cancel",
      onClick(): void {
        // reset
        cancelUpdate();
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
        <div className="column-details__name" onDoubleClick={() => props.changeMode("edit")}>
          {props.column.name}
        </div>
        <div className="column-details__notes-count">{props.notesCount}</div>
      </>
    ) : (
      <input
        ref={inputRef}
        className={classNames("column-details__name", "column-details__name--editing")}
        value={localName}
        onInput={(e) => setLocalName(e.currentTarget.value)}
      />
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
    <div className="column-details" ref={ref}>
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
