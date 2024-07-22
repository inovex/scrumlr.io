import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Button} from "components/Button";
import {FavouriteButton} from "components/Templates";
import {AccessPolicy} from "types/board";
import {ReactComponent as MenuIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as ColumnsIcon} from "assets/icons/columns.svg";
import {ReactComponent as NextIcon} from "assets/icons/next.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import "./TemplateCard.scss";

export const TemplateCard = () => {
  const {t} = useTranslation();

  // will be replaced by actual data later
  const accessPolicy = AccessPolicy.PUBLIC as AccessPolicy;

  const renderAccessPolicy = () => {
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
      <FavouriteButton className="template-card__favourite" active={false} onClick={() => {}} />
      <div className="template-card__head">
        <div className="template-card__title">Title</div>
        <div className="template-card__access-policy">{renderAccessPolicy()}</div>
      </div>
      <MenuIcon className={classNames("template-card__icon", "template-card__icon--menu")} />
      <div className="template-card__description">Lorem ipsum dolor sit amet, conse dolo sadipscing elitr vero eos et aquiteres.</div>
      <ColumnsIcon className={classNames("template-card__icon", "template-card__icon--columns")} />
      <div className="template-card__columns">
        <div className="template-card__columns-title">{t("Templates.TemplateCard.column", {count: 3})}</div>
        <div className="template-card__columns-subtitle">Ideas, Problems & Solutions</div>
      </div>
      <Button className="template-card__start-button" small icon={<NextIcon />}>
        {t("Templates.TemplateCard.start")}
      </Button>
    </div>
  );
};
