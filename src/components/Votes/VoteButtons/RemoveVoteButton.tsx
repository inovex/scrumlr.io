import {FC, useEffect, useState} from "react";
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

  const [doBump, setDoBump] = useState(false);

  useEffect(() => {
    setDoBump(true);
  }, [children]);

  return (
    <DotButton
      className={doBump ? "vote-button-remove bump" : "vote-button-remove"}
      disabled={disabled}
      onClick={deleteVote}
      onAnimationEnd={() => {
        setDoBump(false);
      }}
    >
      <span className="vote-button-remove__folded-corner" />
      <span>{children}</span>
    </DotButton>
  );
};
