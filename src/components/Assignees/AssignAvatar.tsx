import {Avatar} from "components/Avatar";
import {Assignee} from "types/assignee";
import {ExternalAvatar} from "./ExternalAvatar";
import "./AssignAvatar.scss";

export interface AssignAvatarProps {
  participant: Assignee;
}

export const AssignAvatar = ({participant}: AssignAvatarProps) => (
  <div className="assigning__avatar-and-name">
    <div>
      {participant.id != "" ? (
        <Avatar seed={participant.id} avatar={participant.avatar} className="assigning__avatar-board-user" />
      ) : (
        <ExternalAvatar name={participant.name} className="assigning__avatar-external" />
      )}
    </div>
    <figcaption className="assigning__name">{participant.name}</figcaption>
  </div>
);
