import {VFC} from "react";
import {useNavigate} from "react-router";
import {Portal} from "components/Portal";
import {useAppSelector} from "store";
import {Link} from "react-router-dom";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./VotingDialog.scss";

export const VotingDialog: VFC = () => {
  const navigate = useNavigate();
  const boardId = useAppSelector((state) => state.board.data!.id);

  return (
    <Portal darkBackground onClose={() => navigate(`/board/${boardId}`)}>
      <aside className="voting-dialog">
        <article className="voting-dialog__content">
          <h2 className="voting-dialog__header-text">Voting</h2>
          <button className="voting-dialog__button">
            <label>Allow cumulative voting</label>
          </button>
          <button className="voting-dialog__button">
            <label>Anonymous voting</label>
          </button>
          <button className="voting-dialog__button">
            <label>Number of votes</label>
          </button>
          <button className="voting-dialog__start-button">
            <label>Start voting phase</label>
          </button>
        </article>
        <Link to={`/board/${boardId}`} className="voting-dialog__close-button">
          <CloseIcon className="close-button__icon" />
        </Link>
      </aside>
    </Portal>
  );
};
