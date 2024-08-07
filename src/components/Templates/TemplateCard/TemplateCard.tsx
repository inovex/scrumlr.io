import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Button} from "components/Button";
import TextareaAutosize from "react-autosize-textarea";
import {FavouriteButton} from "components/Templates";
import {AccessPolicy} from "types/board";
import {ReactComponent as MenuIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as ColumnsIcon} from "assets/icons/columns.svg";
import {ReactComponent as NextIcon} from "assets/icons/next.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import {BoardTemplate} from "constants/templates";
import "./TemplateCard.scss";

type TemplateCardProps = {
  template: BoardTemplate;
};

export const TemplateCard = ({template}: TemplateCardProps) => {
  const {t} = useTranslation();

  const renderAccessPolicy = (accessPolicy: AccessPolicy) => {
    switch (accessPolicy) {
      case AccessPolicy.BY_PASSPHRASE:
        return <KeyIcon className="template-card__access-policy-icon template-card__access-policy-icon--by-passphrase" />;
      case AccessPolicy.BY_INVITE:
        return <LockIcon className="template-card__access-policy-icon template-card__access-policy-icon--by-passphrase" />;
      default:
        return null;
    }
  };

  return (
    <div className="template-card">
      <FavouriteButton className="template-card__favourite" active={template.favourite} onClick={() => {}} />
      <div className="template-card__head">
        <div className="template-card__title">{template.name}</div>
        <div className="template-card__access-policy">{renderAccessPolicy(template.accessPolicy)}</div>
      </div>
      <MenuIcon className={classNames("template-card__icon", "template-card__icon--menu")} />
      <TextareaAutosize className="template-card__description" disabled onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        {template.description}
      </TextareaAutosize>
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
      <Button className="template-card__start-button" small icon={<NextIcon />}>
        {t("Templates.TemplateCard.start")}
      </Button>
    </div>
  );
};
