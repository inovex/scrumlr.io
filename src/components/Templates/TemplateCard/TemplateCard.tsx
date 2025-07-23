import classNames from "classnames";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "components/Button";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import TextareaAutosize from "react-textarea-autosize";
import {FavouriteButton} from "components/Templates";
import {TemplateWithColumns} from "store/features";
import {useAppSelector} from "store";
import {ReactComponent as MenuIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as ColumnsIcon} from "assets/icons/columns.svg";
import {ReactComponent as NextIcon} from "assets/icons/next.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {ReactComponent as TrashIcon} from "assets/icons/trash.svg";
import {ReactComponent as EditIcon} from "assets/icons/edit.svg";
import "./TemplateCard.scss";

export type TemplateCardType = "RECOMMENDED" | "CUSTOM";

type TemplateCardProps = {
  template: TemplateWithColumns;
  templateType: TemplateCardType;
  onSelectTemplate: (template: TemplateWithColumns) => void;
} & (
  | {
      templateType: "CUSTOM";
      onDeleteTemplate: (templateId: string) => void;
      onToggleFavourite: (templateId: string, favourite: boolean) => void;
      onNavigateToEdit: (templateId: string) => void;
    }
  | {
      templateType: "RECOMMENDED";
      onToggleFavourite: (templateId: string, favourite: boolean) => void;
    }
);

export const TemplateCard = (props: TemplateCardProps) => {
  const {template} = props;
  const columns = useAppSelector((state) => state.templateColumns.filter((col) => col.template === template.template.id));

  const {t} = useTranslation();

  const [showMiniMenu, setShowMiniMenu] = useState(false);

  const closeMenu = () => {
    setShowMiniMenu(false);
  };

  const renderMenu = () => {
    if (props.templateType === "RECOMMENDED") return null;

    return showMiniMenu ? (
      <MiniMenu
        className={classNames("template-card__menu", "template-card__menu--open")}
        items={[
          {label: "Delete", element: <TrashIcon />, onClick: () => props.onDeleteTemplate(template.template.id)},
          {label: "Edit", element: <EditIcon />, onClick: () => props.onNavigateToEdit(template.template.id)},
          {label: "Close", element: <CloseIcon />, onClick: closeMenu},
        ]}
        focusBehaviour="moveFocus"
        onBlur={() => setShowMiniMenu(false)}
        dataCy="template-card__menu"
      />
    ) : (
      <MenuIcon
        className={classNames("template-card__menu", "template-card__icon", "template-card__icon--menu")}
        onClick={() => setShowMiniMenu(true)}
        data-cy="template-card__menu"
      />
    );
  };

  return (
    <div className="template-card" data-cy={`template-card--${props.templateType}`}>
      <FavouriteButton
        className="template-card__favourite"
        active={template.template.favourite}
        onClick={() => {
          props.onToggleFavourite(template.template.id, !template.template.favourite);
        }}
      />
      <div className={classNames("template-card__head")}>
        <input className="template-card__title" type="text" value={template.template.name} disabled />
      </div>
      {renderMenu()}
      <TextareaAutosize className={classNames("template-card__description")} value={template.template.description} disabled />
      <ColumnsIcon className={classNames("template-card__icon", "template-card__icon--columns")} />
      <div className="template-card__columns">
        <div className="template-card__columns-title">{t("Templates.TemplateCard.column", {count: columns.length})}</div>
        <div className="template-card__columns-subtitle">
          {columns
            .toSorted((a, b) => a.index - b.index)
            .map((c) => c.name)
            .join(", ")}
        </div>
      </div>
      <Button
        className={classNames("template-card__start-button", "template-card__start-button--start")}
        small
        icon={<NextIcon />}
        onClick={() => props.onSelectTemplate({template: template.template, columns})}
        dataCy="template-card__start-button"
      >
        {t("Templates.TemplateCard.start")}
      </Button>
    </div>
  );
};
