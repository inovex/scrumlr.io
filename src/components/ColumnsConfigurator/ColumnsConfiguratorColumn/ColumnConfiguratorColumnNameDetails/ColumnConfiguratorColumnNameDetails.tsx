import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {ReactComponent as CheckDoneIcon} from "assets/icons/check-done.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {TextArea} from "components/TextArea/TextArea";
import {MiniMenu, MiniMenuItem} from "components/MiniMenu/MiniMenu";
import {Dispatch, SetStateAction, useRef, useState, FocusEvent} from "react";
import "./ColumnConfiguratorColumnNameDetails.scss";

type ColumnConfiguratorColumnNameDetailsProps = {
  className: string;

  name: string;
  description: string;

  // name/description indicate that the editable section should be opened with focus on either the title or description input
  openState: "closed" | "nameFirst" | "descriptionFirst";
  setOpenState: Dispatch<SetStateAction<"closed" | "nameFirst" | "descriptionFirst">>;

  updateColumnTitle: (newName: string, newDescription: string) => void;
};

export const ColumnConfiguratorColumnNameDetails = (props: ColumnConfiguratorColumnNameDetailsProps) => {
  const {t} = useTranslation();

  const nameWrapperRef = useRef<HTMLDivElement>(null);

  // temporary state for name and description text as the changes have to be confirmed before applying
  const [name, setName] = useState(props.name);
  const [description, setDescription] = useState(props.description);

  const descriptionConfirmMiniMenu: MiniMenuItem[] = [
    {
      element: <CloseIcon />,
      label: t("Templates.ColumnsConfiguratorColumn.cancel"),
      onClick(): void {
        props.setOpenState("closed");
        (document.activeElement as HTMLElement)?.blur();
      },
    },
    {
      element: <CheckDoneIcon />,
      label: t("Templates.ColumnsConfiguratorColumn.save"),
      onClick(): void {
        // props.editColumn?.(props.column, {name, description});
        props.updateColumnTitle(name, description);
        props.setOpenState("closed");
        (document.activeElement as HTMLElement)?.blur();
      },
    },
  ];

  // if we leave the wrapper close, otherwise leave open
  const handleBlurNameWrapperContents = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const isFocusInsideTitleHeaderWrapper = nameWrapperRef.current?.contains(e.relatedTarget);

    if (!isFocusInsideTitleHeaderWrapper) {
      props.setOpenState("closed");
    }
  };

  // note: description gets set to the actual value each time when opening,
  // whereas the name input remains in its current state, meaning name will be visually saved even when canceling
  const openDescriptionWithCurrentValue = () => {
    setDescription(props.description);
    props.setOpenState("descriptionFirst");
  };
  return (
    <div className={classNames(props.className, "column-configurator-column-name-details__name-wrapper")} ref={nameWrapperRef}>
      <input
        className={classNames("column-configurator-column-name-details__name", {"column-configurator-column-name-details__name--editing": props.openState !== "closed"})}
        value={name}
        placeholder={t("Templates.ColumnsConfiguratorColumn.namePlaceholder")}
        onInput={(e) => setName(e.currentTarget.value)}
        onFocus={() => props.setOpenState("nameFirst")}
        onBlur={handleBlurNameWrapperContents}
      />
      {props.openState !== "closed" ? (
        <div className="column-configurator-column-name-details__description-wrapper">
          <TextArea
            className="column-configurator-column-name-details__description-text-area"
            input={description}
            setInput={setDescription}
            placeholder={t("Templates.ColumnsConfiguratorColumn.descriptionPlaceholder")}
            embedded
            small
            autoFocus={props.openState === "descriptionFirst"}
            onBlur={handleBlurNameWrapperContents}
          />
          <MiniMenu className="column-configurator-column-name-details__description-mini-menu" items={descriptionConfirmMiniMenu} small transparent />
        </div>
      ) : (
        <div className="column-configurator-column-name-details__inline-description" role="button" tabIndex={0} onClick={openDescriptionWithCurrentValue}>
          {props.description ? props.description : t("Templates.ColumnsConfiguratorColumn.descriptionPlaceholder")}
        </div>
      )}
    </div>
  );
};
