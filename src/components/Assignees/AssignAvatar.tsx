import {Avatar} from "components/Avatar";
import {Assignee} from "types/assignee";
import {ExternalAvatar} from "./ExternalAvatar";

export interface AssignAvatarProps {
  participant: Assignee;
  caption?: boolean;
}

export const AssignAvatar = ({participant, caption = false}: AssignAvatarProps) => (
    <figure className="participant__avatar-and-name" aria-roledescription="participant">
      {participant.user ? <Avatar seed={participant.user.id} avatar={participant.user.avatar} className="assign-avatar" /> : <ExternalAvatar name={participant.name} />}
      {caption && <figcaption className="participant__name">{participant.name}</figcaption>}
    </figure>
  );
