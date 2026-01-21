import {Column, createColumn, deleteColumnOptimistically, editColumn} from "store/features";
import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import classNames from "classnames";
import {ArrowDownIcon, ThreeDotsIcon as SettingsIcon, CheckDoneIcon, CloseIcon, EditIcon} from "components/Icon";
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

export type ColumnDetailsMode = "view" | "edit" | "moderator-view";

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
  const anyColumnHasDescription = useAppSelector((state) => state.columns.some((column) => column.description && column.description.trim().length > 0));

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

  const hasInputChanged = () => !(localName === props.column.name && localDescription === props.column.description);

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

    if (!hasInputChanged()) {
      props.changeMode("view");
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

    // behaviour: save on blur
    // same behaviour with the template editor
    updateColumnDetails();
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
    props.mode === "edit" ? (
      <input
        {...emoji.inputBindings}
        ref={inputRef}
        className={classNames("column-details__name", "column-details__name--editing")}
        maxLength={MAX_BOARD_NAME_LENGTH}
        onKeyUp={(e) => {
          // handle emoji input first
          emoji.inputBindings.onKeyDown?.(e);
          if (e.defaultPrevented) return;

          // handle Enter key submission
          if (e.key === "Enter") {
            e.preventDefault();
            updateColumnDetails();
          }
          // escape to cancel
          else if (e.key === "Escape") {
            e.preventDefault();
            cancelUpdate();
            changeMode("view");
          }
        }}
      />
    ) : (
      <>
        <div
          ref={viewNameRef}
          id={`col-${props.column.id}-name`}
          className={classNames("column-details__name", {
            "column-details__name--moderator": props.mode === "moderator-view",
          })}
          onClick={() => {
            setFocusTarget("name");
            changeMode("edit");
          }}
          role="button"
          tabIndex={0}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFocusTarget("name");
              changeMode("edit");
            }
          }}
        >
          {props.column.name}
        </div>
        <div className="column-details__notes-count">{props.notesCount}</div>
        {props.mode === "moderator-view" && (
          <EditIcon
            className="column-details__edit-icon"
            onClick={() => {
              setFocusTarget("name");
              changeMode("edit");
            }}
          />
        )}
        {isNameTextTruncated.horizontal && <Tooltip anchorSelect={`#col-${props.column.id}-name`} content={props.column.name} color={props.column.color} />}
      </>
    );

  const viewableDescription = () => {
    // expandable content
    if (props.column.description)
      return (
        <>
          <TextArea
            ref={viewDescriptionRef}
            className={classNames({
              "column-details__description--moderator": props.mode === "moderator-view",
            })}
            input={props.column.description}
            setInput={() => {}}
            embedded
            extendable={isDescriptionExpanded}
            readOnly
            border="none"
            rows={2}
            onClick={() => {
              setFocusTarget("description");
              changeMode("edit");
            }}
          />
          {(isDescriptionTextTruncated.vertical || isDescriptionExpanded) && (
            <button className={classNames("column-details__description-expand-icon-container")} onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}>
              <ArrowDownIcon className={classNames("column-details__description-expand-icon", {"column-details__description-expand-icon--expanded": isDescriptionExpanded})} />
            </button>
          )}
        </>
      );
    if (isModerator) {
      // placeholder
      return (
        <div
          className={classNames("column-details__description--placeholder", {
            "column-details__description--placeholder-moderator": props.mode === "moderator-view",
          })}
          onClick={() => {
            setFocusTarget("description");
            changeMode("edit");
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFocusTarget("description");
              changeMode("edit");
            }
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
        onCancel={() => {
          cancelUpdate();
          changeMode("view");
        }}
        onSubmit={updateColumnDetails}
      />
      <MiniMenu className="column-details__description-mini-menu" items={saveColumnDetailsMiniMenu} transparent />
    </>
  );

  const renderDescription = () => (props.mode === "edit" ? editableDescription() : viewableDescription());

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
    <div
      className={classNames("column-details", {
        "column-details--moderator-view": props.mode === "moderator-view",
      })}
      ref={containerRef}
    >
      <div className="column-details__name-and-settings-wrapper">
        <div className="column-details__name-wrapper">{renderName()}</div>
        {renderSettings()}
      </div>
      <div
        className={classNames("column-details__description-wrapper", `column-details__description-wrapper--${props.mode}`, {
          // Apply --empty class (min-height: 0) only when
          // Component is in view mode (not edit) AND No other column on the board has a description
          // This ensures visual consistency - if any column has content, all columns maintain the same height
          "column-details__description-wrapper--empty": props.mode === "view" && !anyColumnHasDescription,
        })}
      >
        {renderDescription()}
      </div>
      <EmojiSuggestions positionRelative {...emoji.suggestionsProps} /> {/* suggestions for name input, as textarea has its own */}
    </div>
  );
};
