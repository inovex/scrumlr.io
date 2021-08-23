type DeleteVoteProps = {
  deleteVote: () => void;
  numberOfVotes: number;
};

export const DeleteVote = (props: DeleteVoteProps) => (
  <button
    className="votes__delete"
    onClick={(e) => {
      e.stopPropagation();
      props.deleteVote();
    }}
  >
    {props.numberOfVotes}
  </button>
);
