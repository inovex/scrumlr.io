type AddVoteProps = {
  addVote: () => void;
};

export const AddVote = (props: AddVoteProps) => (
  <button
    className="votes__add"
    onClick={(e) => {
      e.stopPropagation();
      props.addVote();
    }}
  >
    +
  </button>
);
