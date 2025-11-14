import classNames from "classnames";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {useTranslation} from "react-i18next";
import {ReactComponent as CheckDoneIcon} from "assets/icons/check-done.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {TextArea} from "components/TextArea/TextArea";
import {MiniMenu, MiniMenuItem} from "components/MiniMenu/MiniMenu";
import {Dispatch, SetStateAction, useRef, useState} from "react";
import {MAX_COLUMN_DESCRIPTION_LENGTH} from "constants/misc";
import "./ColumnConfiguratorColumnNameDetails.scss";

export type OpenState = "closed" | "visualFeedback" | "nameFirst" | "descriptionFirst";

export type ColumnConfiguratorColumnNameDetailsProps = {
  className: string;

  name: string;
  description: string;

  // name/description indicate that the editable section should be opened with focus on either the title or description input
  openState: OpenState;
  setOpenState: Dispatch<SetStateAction<OpenState>>;

  updateColumnTitle: (newName: string, newDescription: string) => void;
};

export const ColumnConfiguratorColumnNameDetails = (props: ColumnConfiguratorColumnNameDetailsProps) => {
  const {t} = useTranslation();

  // temporary state for name and description text as the changes have to be confirmed before applying
  const [name, setName] = useState(props.name);
  const [description, setDescription] = useState(props.description);

  const isEditing = props.openState === "nameFirst" || props.openState === "descriptionFirst";

  const nameInputRef = useRef<HTMLInputElement>(null);

  const cancelChanges = () => {
    props.setOpenState("closed");
    nameInputRef.current?.blur(); // leave input (or we can keep typing inside it)
  };

  const saveChanges = () => {
    props.updateColumnTitle(name, description);
    // show visual feedback for 2s before displaying menu options again
    nameInputRef.current?.blur(); // leave input (or we can keep typing inside it)
    props.setOpenState("visualFeedback");
    setTimeout(() => {
      props.setOpenState("closed");
    }, 2000);
  };

  // if we leave the wrapper, reset and close
  const handleBlurNameWrapperContents = () => {
    props.setOpenState("closed");
    setName(props.name);
    setDescription(props.description);
  };

  const nameWrapperRef = useOnBlur<HTMLDivElement>(handleBlurNameWrapperContents);

  const descriptionConfirmMiniMenu: MiniMenuItem[] = [
    {
      className: "mini-menu-item--cancel",
      element: <CloseIcon />,
      label: t("Templates.ColumnsConfiguratorColumn.cancel"),
      onClick: cancelChanges,
    },
    {
      className: "mini-menu-item--save",
      element: <CheckDoneIcon />,
      label: t("Templates.ColumnsConfiguratorColumn.save"),
      onClick: saveChanges,
    },
  ];

  const openDescriptionWithCurrentValue = () => {
    setDescription(props.description);
    props.setOpenState("descriptionFirst");
  };

  return (
    <div className={classNames(props.className, "column-configurator-column-name-details__name-wrapper")} ref={nameWrapperRef}>
      <input
        ref={nameInputRef}
        className={classNames("column-configurator-column-name-details__name", {"column-configurator-column-name-details__name--editing": isEditing})}
        value={name}
        placeholder={t("Templates.ColumnsConfiguratorColumn.namePlaceholder")}
        onInput={(e) => setName(e.currentTarget.value)}
        onFocus={() => props.setOpenState("nameFirst")}
        autoComplete="off"
        onKeyUp={(e) => {
          // handle Enter key submission
          if (e.key === "Enter") {
            e.preventDefault();
            saveChanges();
          }
          // escape to cancel
          else if (e.key === "Escape") {
            e.preventDefault();
            cancelChanges();
          }
        }}
      />
      {isEditing ? (
        <div className="column-configurator-column-name-details__description-wrapper">
          <TextArea
            className="column-configurator-column-name-details__description-text-area"
            input={description}
            setInput={setDescription}
            placeholder={t("Templates.ColumnsConfiguratorColumn.descriptionPlaceholder")}
            embedded
            fitted
            autoFocus={props.openState === "descriptionFirst"}
            maxLength={MAX_COLUMN_DESCRIPTION_LENGTH}
            onSubmit={saveChanges}
            onCancel={cancelChanges}
          />
          <MiniMenu className="column-configurator-column-name-details__description-mini-menu" items={descriptionConfirmMiniMenu} transparent />
        </div>
      ) : (
        <div
          className={classNames("column-configurator-column-name-details__inline-description", {
            "column-configurator-column-name-details__inline-description--visual-feedback": props.openState === "visualFeedback",
            "column-configurator-column-name-details__inline-description--has-content": props.description && props.description.trim().length > 0,
          })}
          role="button"
          tabIndex={0}
          onClick={openDescriptionWithCurrentValue}
        >
          {props.description ? props.description : t("Templates.ColumnsConfiguratorColumn.descriptionPlaceholder")}
        </div>
      )}
    </div>
  );
};
