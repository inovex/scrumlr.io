import {UserAvatar} from "components/BoardUsers";
import {Auth} from "types/auth";

export interface ChipProps {
  participant: Auth;
}

export const Chip = (props: ChipProps) => (
    <div className="chip">
      <UserAvatar
        id={props.participant.id}
        avatar={props.participant.avatar}
        name={props.participant.name}
        className="note-dialog__note-user-avatar"
        avatarClassName="note-dialog__note-user-avatar"
      />
      <label>{props.participant.name}</label>
    </div>
  );
