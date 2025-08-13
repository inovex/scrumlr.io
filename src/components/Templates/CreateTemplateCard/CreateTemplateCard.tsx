import {ReactComponent as PlusIcon} from "assets/icons/plus.svg";
import {useTranslation} from "react-i18next";
import "./CreateTemplateCard.scss";
import {Tooltip} from "components/Tooltip/Tooltip";
import {uniqueId} from "underscore";

type CreateTemplateCardProps = {
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
};

export const CreateTemplateCard = (props: CreateTemplateCardProps) => {
  const {t} = useTranslation();
  const anchor = uniqueId("create-button-");

  return (
    <>
      <button id={anchor} className="create-template-card" disabled={props.disabled} onClick={props.onClick} data-cy="create-template-card" tabIndex={props.disabled ? -1 : 0}>
        <PlusIcon className="create-template-card__icon" />
        <div className="create-template-card__title">{t("Templates.CreateTemplateCard.create")}</div>
      </button>
      {props.disabled && props.tooltip && <Tooltip anchorSelect={`#${anchor}`} content={t(props.tooltip)} />}
    </>
  );
};
