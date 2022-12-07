import {useState} from "react";
import {useDispatch} from "react-redux";
import {useAppSelector} from "store";
import {Actions} from "store/action";

export interface BasicAssignProps {
  noteId: string;
}

export const Assigning = ({noteId}: BasicAssignProps) => {
  const dispatch = useDispatch();
  const [userInput, setUserInput] = useState("");
  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));

  const onSubmitHandler = () => {
    dispatch(Actions.editNote(noteId, {assignees: [userInput]}));
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
        value={note?.assignees ? note?.assignees[0] : userInput}
      />
    </div>
  );
};
