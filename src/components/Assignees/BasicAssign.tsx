import {useState} from "react";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";

export interface BasicAssignProps {
  noteId: string;
}

export const BasicAssign = (props: BasicAssignProps) => {
  const dispatch = useDispatch();

  const [userInput, setUserInput] = useState("");

  const onSubmitHandler = () => {
    dispatch(Actions.addAssignee(props.noteId, userInput));
  };

  const onClearHandler = () => {
    dispatch(Actions.removeAssignee(props.noteId, userInput));
  };

  return (
    <div onClick={(e) => e.stopPropagation}>
      <button onClick={onSubmitHandler}>submit</button>
      <input
        type="text"
        onChange={(e) => {
          console.log(e.target.value);
          setUserInput(e.target.value);
        }}
      />
      <button onClick={onClearHandler}>clear</button>
    </div>
  );
};
