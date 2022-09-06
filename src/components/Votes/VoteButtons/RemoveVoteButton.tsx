import {FC} from "react";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {DotButton} from "components/DotButton";
import "./RemoveVoteButton.scss";

type RemoveVoteProps = {
  noteId: string;
  disabled?: boolean;
};

export const RemoveVoteButton: FC<RemoveVoteProps> = ({noteId, disabled, children}) => {
  const dispatch = useDispatch();

  const deleteVote = () => {
    dispatch(Actions.deleteVote(noteId));
  };

  return (
    <DotButton className="vote-button-remove" disabled={disabled} onClick={deleteVote}>
      <span className="vote-button-remove__folded-corner" />
      <span>{children}</span>
    </DotButton>
  );
};
