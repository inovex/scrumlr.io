import {ReactComponent as PlusIcon} from "assets/icons/plus.svg";
import "./CreateTemplateCard.scss";

type CreateTemplateCardProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export const CreateTemplateCard = (props: CreateTemplateCardProps) => (
  <button className="create-template-card" disabled={props.disabled} onClick={props.onClick}>
    <PlusIcon className="create-template-card__icon" />
    <div className="create-template-card__title">Create new template</div>
  </button>
);
