import {FC, PropsWithChildren, useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {DotButton} from "components/DotButton";
import "./RemoveVoteButton.scss";
import classNames from "classnames";
import {ReactComponent as RemoveIcon} from "assets/icon-remove.svg";

type RemoveVoteProps = {
  noteId: string;
  disabled?: boolean;
};

export const RemoveVoteButton: FC<PropsWithChildren<RemoveVoteProps>> = ({noteId, disabled, children}) => {
  const dispatch = useDispatch();

  const deleteVote = () => {
    dispatch(Actions.deleteVote(noteId));
  };

  const [doBump, setDoBump] = useState(false);
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setDoBump(true);
  }, [children]);

  return (
    <DotButton
      className={classNames("vote-button-remove", {bump: doBump})}
      disabled={disabled}
      onClick={deleteVote}
      onAnimationEnd={() => {
        setDoBump(false);
      }}
    >
      <span className="vote-button-remove__folded-corner" />
      <RemoveIcon className="vote-button-remove__icon" />
      <span className="vote-button-remove__count">{children}</span>
    </DotButton>
  );
};
