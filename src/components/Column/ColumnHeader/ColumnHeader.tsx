import {useAppDispatch} from "store";
import {editColumn} from "store/features";
import {Color} from "constants/colors";
import {hotkeyMap} from "constants/hotkeys";
import {NoteInput} from "components/NoteInput";
import "./ColumnHeader.scss";

const {SELECT_NOTE_INPUT_FIRST_KEY} = hotkeyMap;

export interface ColumnProps {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
}

export const Column = ({id, name, color, visible, index}: ColumnProps) => {
  const dispatch = useAppDispatch();

  const toggleVisibilityHandler = () => {
    dispatch(
      editColumn({
        id,
        column: {
          name,
          color,
          index,
          visible: !visible,
        },
      })
    );
  };

  return (
    <div className="column__header">
      <NoteInput
        columnIndex={index}
        columnId={id}
        columnIsVisible={visible}
        toggleColumnVisibility={toggleVisibilityHandler}
        hotkeyKey={`${SELECT_NOTE_INPUT_FIRST_KEY.map((key, i) => (i === 0 ? `${key.toUpperCase()}/` : key.toUpperCase())).join("")} + ${index + 1}`}
      />
    </div>
  );
};
