import {ReactComponent as PlusIcon} from "assets/icons/plus.svg";
import "./CreateBoardCard.scss";

export const CreateBoardCard = () => (
  <button className="create-board-card">
    <PlusIcon className="create-board-card__icon" />
    <div className="create-board-card__title">Create new board</div>
  </button>
);
