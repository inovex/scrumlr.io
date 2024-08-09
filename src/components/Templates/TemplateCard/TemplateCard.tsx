import classNames from "classnames";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "components/Button";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import TextareaAutosize from "react-autosize-textarea";
import {FavouriteButton} from "components/Templates";
import {AccessPolicy} from "types/board";
import {ReactComponent as MenuIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as ColumnsIcon} from "assets/icons/columns.svg";
import {ReactComponent as NextIcon} from "assets/icons/next.svg";
import {ReactComponent as DoneIcon} from "assets/icons/check-done.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {ReactComponent as TrashIcon} from "assets/icons/trash.svg";
import {ReactComponent as EditIcon} from "assets/icons/edit.svg";
import {BoardTemplate} from "constants/templates";
import "./TemplateCard.scss";

type TemplateCardType = "RECOMMENDED" | "CUSTOM";

type TemplateCardProps = {
  template: BoardTemplate;
  templateType: TemplateCardType;
};

export const TemplateCard = ({template, templateType}: TemplateCardProps) => {
  const {t} = useTranslation();

  const [showMiniMenu, setShowMiniMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(template.name);
  const [description, setDescription] = useState(template.description);

  const closeMenu = () => {
    setEditing(false);
    setShowMiniMenu(false);
  };

  const renderAccessPolicy = (accessPolicy: AccessPolicy) => {
    switch (accessPolicy) {
      case AccessPolicy.BY_PASSPHRASE:
        return <KeyIcon className="template-card__access-policy-icon template-card__access-policy-icon--by-passphrase" />;
      case AccessPolicy.BY_INVITE:
        return <LockIcon className="template-card__access-policy-icon template-card__access-policy-icon--by-invite" />;
      default:
        return null;
    }
  };

  const renderMenu = () => {
    if (templateType === "RECOMMENDED") return null;
    return showMiniMenu ? (
      <MiniMenu
        className="template-card__menu"
        items={[
          {label: "Delete", icon: <TrashIcon />, onClick: closeMenu},
          {label: "Edit", icon: <EditIcon />, onClick: () => setEditing((curr) => !curr), active: editing},
          {label: "Close", icon: <CloseIcon />, onClick: closeMenu},
        ]}
      />
    ) : (
      <MenuIcon className={classNames("template-card__menu", "template-card__icon", "template-card__icon--menu")} onClick={() => setShowMiniMenu(true)} />
    );
  };

  const renderButton = () =>
    editing ? (
      <Button className={classNames("template-card__start-button", "template-card__start-button--save")} type="secondary" small icon={<DoneIcon />}>
        {t("Templates.TemplateCard.save")}
      </Button>
    ) : (
      <Button className={classNames("template-card__start-button", "template-card__start-button--start")} small icon={<NextIcon />}>
        {t("Templates.TemplateCard.start")}
      </Button>
    );

  return (
    <div className="template-card">
      <FavouriteButton className="template-card__favourite" active={template.favourite} onClick={() => {}} />
      <div className={classNames("template-card__head", {"template-card__head--editing": editing})}>
        <input className="template-card__title" type="text" value={title} disabled={!editing} onInput={(e) => setTitle(e.currentTarget.value)} />
        <div className="template-card__access-policy">{renderAccessPolicy(template.accessPolicy)}</div>
      </div>
      {renderMenu()}
      <TextareaAutosize
        className={classNames("template-card__description", {"template-card__description--editing": editing})}
        value={description}
        disabled={!editing}
        onInput={(e) => setDescription(e.currentTarget.value)}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
      <ColumnsIcon className={classNames("template-card__icon", "template-card__icon--columns")} />
      <div className="template-card__columns">
        <div className="template-card__columns-title">{t("Templates.TemplateCard.column", {count: template.columns.length})}</div>
        <div className="template-card__columns-subtitle">
          {template.columns
            .sort((a, b) => a.index - b.index)
            .map((c) => c.name)
            .join(", ")}
        </div>
      </div>
      {renderButton()}
    </div>
  );
};
