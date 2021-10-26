import "./BoardUser.scss";
import classNames from "classnames";
import {Avatar} from "../Avatar";

export interface UserAvatarProps {
  className?: string;
  id: string;
  name: string;
  avatar?: string;
}

export const UserAvatar = ({name, id, avatar, className}: UserAvatarProps) => (
  <div className={classNames("user-avatar", className)}>{avatar ? <img src={avatar} alt={name} /> : <Avatar seed={id} />}</div>
);
