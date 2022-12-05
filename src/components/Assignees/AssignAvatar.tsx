import {Assign} from "types/assign";

export interface AssignAvatarProps {
  participant: Assign;
  caption?: boolean;
}

export const AssignAvatar = ({participant, caption = false}: AssignAvatarProps) => (
  <figure className="participant__avatar-and-name" aria-roledescription="participant">
    {
      // participant.user.id
      // ? <Avatar seed={participant.user.id!} avatar={participant.user.avatar!} className="assign-avatar" />
      // : <ExternalAvatar name={participant.user.name} />
    }
    {caption && <figcaption className="participant__name">{participant.name}</figcaption>}
  </figure>
);
