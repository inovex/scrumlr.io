import {ReactComponent as PlusIcon} from "assets/icons/plus.svg";
import "./CreateTemplateCard.scss";

export const CreateTemplateCard = () => (
  <button className="create-template-card">
    <PlusIcon className="create-template-card__icon" />
    <div className="create-template-card__title">Create new template</div>
  </button>
);
