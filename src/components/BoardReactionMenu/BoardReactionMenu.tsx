import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./BoardReactionMenu.scss";

export const BoardReactionMenu = () => (
    <div className="board-reactions__root">
      <div className="board-reactions__container">
        <div className="board-reactions__item board-reactions__reaction">🥳</div>
        <div className="board-reactions__item board-reactions__reaction">😂</div>
        <div className="board-reactions__item board-reactions__reaction">💖</div>
        <div className="board-reactions__item board-reactions__reaction">👍</div>
        <div className="board-reactions__item board-reactions__reaction">💩</div>
        <CloseIcon className="board-reactions__item board-reactions__close" aria-hidden />
      </div>
    </div>
  );
