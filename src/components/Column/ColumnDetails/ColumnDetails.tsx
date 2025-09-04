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
import {TextArea} from "components/TextArea/TextArea";
import {MiniMenu, MiniMenuItem} from "components/MiniMenu/MiniMenu";
import {useAppDispatch, useAppSelector} from "store";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {Tooltip} from "components/Tooltip";
import {MAX_BOARD_NAME_LENGTH, MAX_COLUMN_DESCRIPTION_LENGTH, MAX_COLUMN_NAME_LENGTH} from "constants/misc";
import {useEmojiAutocomplete} from "utils/hooks/useEmojiAutocomplete";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import {useSubmitOnShortcut} from "utils/hooks/useSubmitOnShortcut";
import "components/Column/ColumnDetails/ColumnDetails.scss";

export type ColumnDetailsMode = "view" | "edit";

export type ColumnDetailsProps = {
  column: Column;
  notesCount: number;
  mode: ColumnDetailsMode;
  changeMode: (mode: ColumnDetailsMode) => void;
  isTemporary: boolean;
};

export const ColumnDetails = (props: ColumnDetailsProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const isModerator = useAppSelector((state) => state.participants?.self?.role === "OWNER" || state.participants?.self?.role === "MODERATOR");

  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const {isTextTruncated: isDescriptionTextTruncated, textRef: viewDescriptionRef} = useTextOverflow<HTMLTextAreaElement>(props.column.description);
  const {isTextTruncated: isNameTextTruncated, textRef: viewNameRef} = useTextOverflow<HTMLDivElement>(props.column.name);

  const [openSettings, setOpenSettings] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [focusTarget, setFocusTarget] = useState<"name" | "description">("name");

  const [localName, setLocalName] = useState(props.column.name);
  const [localDescription, setLocalDescription] = useState(props.column.description);

  // emoji autocomplete for column name
  const {...emoji} = useEmojiAutocomplete({
    inputRef,
    value: localName,
    onValueChange: setLocalName,
    maxInputLength: MAX_COLUMN_NAME_LENGTH,
  });

  const isValidName = localName.trim().length > 0 && localName.length <= MAX_BOARD_NAME_LENGTH;
  const isValidDescription = localDescription.length <= MAX_COLUMN_DESCRIPTION_LENGTH;
  const isValidDetails = isValidName && isValidDescription;

  // focus input upon entering edit mode
  useEffect(() => {
    if (props.mode === "edit") {
      if (focusTarget === "name" && inputRef.current) {
        inputRef.current.focus();
      } else if (focusTarget === "description" && descriptionRef.current) {
        descriptionRef.current.focus();
      }
    }
  }, [props.mode, focusTarget]);

  const changeMode = (mode: ColumnDetailsMode) => {
    if (!isModerator) return;

    props.changeMode(mode);
  };

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
  const updateColumnDetails = () => {
    if (!isValidDetails) {
      cancelUpdate();
      return;
    }

    const updateColumnPayload: Column = {...props.column, name: localName, description: localDescription};
    if (props.isTemporary) {
      dispatch(createColumn(updateColumnPayload));
    } else {
      dispatch(editColumn({id: props.column.id, column: updateColumnPayload}));
    }

    changeMode("view");
  };

  const handleBlur = () => {
    if (props.mode === "view") return;

    // behaviour: do not save
    // could also change it to only save if persisted is empty or always save,
    // but this is streamlined with the template editor
    cancelUpdate();
    changeMode("view");
  };

  useSubmitOnShortcut(inputRef, updateColumnDetails);

  const containerRef = useOnBlur<HTMLDivElement>(handleBlur);

  const saveColumnDetailsMiniMenu: MiniMenuItem[] = [
    {
      className: "mini-menu-item--cancel",
      element: <CloseIcon />,
      label: "Cancel",
      onClick(): void {
        // reset
        cancelUpdate();
        changeMode("view");
      },
    },
    {
      className: "mini-menu-item--save",
      element: <CheckDoneIcon />,
      label: "Save",
      disabled: !isValidDetails,
      onClick(): void {
        updateColumnDetails();
        changeMode("view");
      },
    },
  ];

  const renderName = () =>
    props.mode === "view" ? (
      <>
        <div
          ref={viewNameRef}
          id={`col-${props.column.id}-name`}
          className="column-details__name"
          onDoubleClick={() => {
            setFocusTarget("name");
            changeMode("edit");
          }}
        >
          {props.column.name}
        </div>
        <div className="column-details__notes-count">{props.notesCount}</div>
        {isNameTextTruncated.horizontal && <Tooltip anchorSelect={`#col-${props.column.id}-name`} content={props.column.name} color={props.column.color} />}
      </>
    ) : (
      <input {...emoji.inputBindings} ref={inputRef} className={classNames("column-details__name", "column-details__name--editing")} maxLength={MAX_BOARD_NAME_LENGTH} />
    );

  const viewableDescription = () => {
    // expandable content
    if (props.column.description)
      return (
        <>
          <TextArea
            ref={viewDescriptionRef}
            input={props.column.description}
            setInput={() => {}}
            embedded
            extendable={isDescriptionExpanded}
            readOnly
            border="none"
            rows={2}
            onDoubleClick={() => {
              setFocusTarget("description");
              changeMode("edit");
            }}
          />
          {(isDescriptionTextTruncated.vertical || isDescriptionExpanded) && (
            <button className={classNames("column-details__description-expand-icon-container")} onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}>
              <ArrowIcon className={classNames("column-details__description-expand-icon", {"column-details__description-expand-icon--expanded": isDescriptionExpanded})} />
            </button>
          )}
        </>
      );
    if (isModerator) {
      // placeholder
      return (
        <div
          className="column-details__description--placeholder"
          onDoubleClick={() => {
            setFocusTarget("description");
            changeMode("edit");
          }}
        >
          {t("Column.Header.descriptionPlaceholder")}
        </div>
      );
    }
    // empty placeholder space
    return <div className="column-details__description--placeholder" />;
  };

  const editableDescription = () => (
    <>
      <TextArea
        ref={descriptionRef}
        className="column-details__description-text-area"
        input={localDescription}
        setInput={setLocalDescription}
        placeholder={t("Column.Header.descriptionPlaceholder")}
        embedded
        extendable
        border="thick"
        rows={3}
        emojiSuggestions
        maxLength={MAX_COLUMN_DESCRIPTION_LENGTH}
        onSubmit={updateColumnDetails}
      />
      <MiniMenu className="column-details__description-mini-menu" items={saveColumnDetailsMiniMenu} small transparent />
    </>
  );

  const renderDescription = () => (props.mode === "view" ? viewableDescription() : editableDescription());

  const renderSettings = () => {
    if (!isModerator) return null;

    if (openSettings) {
      return (
        <ColumnSettings
          className={classNames("column-details__settings", "column-details__settings--open")}
          column={props.column}
          onClose={() => setOpenSettings(false)}
          onNameEdit={() => {
            setFocusTarget("name");
            changeMode("edit");
          }}
        />
      );
    }
    return (
      <button
        className={classNames("column-details__settings", "column-details__settings--closed", "column-details__settings-icon-container")}
        onClick={() => setOpenSettings(true)}
      >
        <SettingsIcon className="column-details__settings-icon" />
      </button>
    );
  };

  return (
    <div className="column-details" ref={containerRef}>
      <div className="column-details__name-and-settings-wrapper">
        <div className="column-details__name-wrapper">{renderName()}</div>
        {renderSettings()}
      </div>
      <div className={classNames("column-details__description-wrapper", `column-details__description-wrapper--${props.mode}`)}>{renderDescription()}</div>
      <EmojiSuggestions positionRelative {...emoji.suggestionsProps} /> {/* suggestions for name input, as textarea has its own */}
    </div>
  );
};
