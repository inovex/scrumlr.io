import {UserAvatar} from "components/BoardUsers";
import {useState} from "react";
import {Auth} from "types/auth";

export interface AssigneeProps {
  participant: Auth;
  index: number;
}

export const Assignee = (props: AssigneeProps) => {
  const [selected, setSelected] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setSelected(!selected);
        }}
      >
        <input type="checkbox" readOnly checked={selected} />
        <UserAvatar
          id={props.participant.id}
          avatar={props.participant.avatar}
          name={props.participant.name}
          className="note-dialog__note-user-avatar"
          avatarClassName="note-dialog__note-user-avatar"
        />
        <label>{props.participant.name}</label>
      </button>
    </div>
  );
};
