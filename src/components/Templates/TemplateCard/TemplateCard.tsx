import classNames from "classnames";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {Button} from "components/Button";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import TextareaAutosize from "react-autosize-textarea";
import {FavouriteButton} from "components/Templates";
import {useAppDispatch} from "store";
import {AccessPolicy, createBoardFromTemplate, Template} from "store/features";
import {ReactComponent as MenuIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as ColumnsIcon} from "assets/icons/columns.svg";
import {ReactComponent as NextIcon} from "assets/icons/next.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {ReactComponent as TrashIcon} from "assets/icons/trash.svg";
import {ReactComponent as EditIcon} from "assets/icons/edit.svg";
import "./TemplateCard.scss";

type TemplateCardType = "RECOMMENDED" | "CUSTOM";

type TemplateCardProps = {
  template: Template;
  templateType: TemplateCardType;
};

export const TemplateCard = ({template, templateType}: TemplateCardProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showMiniMenu, setShowMiniMenu] = useState(false);

  const closeMenu = () => {
    setShowMiniMenu(false);
  };

  const navigateToEdit = () => {
    // TODO
  };

  const createBoard = () => {
    dispatch(createBoardFromTemplate(template))
      .unwrap()
      .then((boardId) => navigate(`/board/${boardId}`));
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
        className={classNames("template-card__menu", "template-card__menu--open")}
        items={[
          {label: "Delete", element: <TrashIcon />, onClick: closeMenu},
          {label: "Edit", element: <EditIcon />, onClick: navigateToEdit},
          {label: "Close", element: <CloseIcon />, onClick: closeMenu},
        ]}
      />
    ) : (
      <MenuIcon className={classNames("template-card__menu", "template-card__icon", "template-card__icon--menu")} onClick={() => setShowMiniMenu(true)} />
    );
  };

  return (
    <div className="template-card">
      <FavouriteButton className="template-card__favourite" active={template.favourite} onClick={() => {}} />
      <div className={classNames("template-card__head")}>
        <input className="template-card__title" type="text" value={template.name} disabled />
        <div className="template-card__access-policy">{renderAccessPolicy(template.accessPolicy)}</div>
      </div>
      {renderMenu()}
      <TextareaAutosize
        className={classNames("template-card__description")}
        value={template.description}
        disabled
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
      <ColumnsIcon className={classNames("template-card__icon", "template-card__icon--columns")} />
      <div className="template-card__columns">
        <div className="template-card__columns-title">{t("Templates.TemplateCard.column", {count: template.columns.length})}</div>
        <div className="template-card__columns-subtitle">
          {[...template.columns] // shallow copy
            .sort((a, b) => a.index - b.index)
            .map((c) => c.name)
            .join(", ")}
        </div>
      </div>
      <Button className={classNames("template-card__start-button", "template-card__start-button--start")} small icon={<NextIcon />} onClick={createBoard}>
        {t("Templates.TemplateCard.start")}
      </Button>
    </div>
  );
};
