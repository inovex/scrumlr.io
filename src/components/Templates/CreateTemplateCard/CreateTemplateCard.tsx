import {ReactComponent as PlusIcon} from "assets/icons/plus.svg";
import {useTranslation} from "react-i18next";
import "./CreateTemplateCard.scss";

type CreateTemplateCardProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export const CreateTemplateCard = (props: CreateTemplateCardProps) => {
  const {t} = useTranslation();

  return (
    <button className="create-template-card" disabled={props.disabled} onClick={props.onClick}>
      <PlusIcon className="create-template-card__icon" />
      <div className="create-template-card__title">{t("Templates.CreateTemplateCard.create")}</div>
    </button>
  );
};
