import {useEffect, useState, useRef} from "react";
import classNames from "classnames";
import {ReactComponent as IconCheck} from "assets/icon-ready.svg";
import {ReactComponent as RaisedHand} from "assets/icon-hand.svg";
import {AvataaarProps, Avatar} from "../Avatar";
import {Badge} from "../Badge";
import "./UserAvatar.scss";

export interface UserAvatarProps {
  className?: string;
  avatarClassName?: string;
  id: string;
  avatar?: AvataaarProps;
  title: string;
  ready?: boolean;
  raisedHand?: boolean;
  badgeText?: string;
}

export const UserAvatar = ({title, badgeText, id, ready, raisedHand, avatar, className, avatarClassName}: UserAvatarProps) => {
  const [readyAnimation, setReadyAnimation] = useState<boolean>(false);
  const prevReadyRef = useRef<boolean>();

  useEffect(() => {
    if (ready && prevReadyRef.current === false) {
      setReadyAnimation(true);
      setTimeout(() => setReadyAnimation(false), 600);
    }

    prevReadyRef.current = ready;
  }, [ready]);

  return (
    <div className={classNames("user-avatar", className, ready && "user-ready", {"user-avatar--ready-animated": readyAnimation})} title={title}>
      {ready && <IconCheck className="user-avatar__ready" />}
      {raisedHand && <RaisedHand className="user-avatar__raised-hand" />}
      <Avatar seed={id} avatar={avatar} className={avatarClassName} />
      {badgeText && <Badge text={badgeText} />}
    </div>
  );
};
