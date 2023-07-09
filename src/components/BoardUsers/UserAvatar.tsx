import {useEffect, useRef, useState} from "react";
import "./UserAvatar.scss";
import classNames from "classnames";
import {ReactComponent as IconCheck} from "assets/icon-ready.svg";
import {ReactComponent as RaisedHand} from "assets/icon-hand.svg";
import {AvataaarProps, Avatar} from "../Avatar";
import {Badge} from "../Badge";

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
  const [showHand, setShowHand] = useState<boolean | undefined>(raisedHand);
  const prevReadyRef = useRef<boolean | undefined>(ready);
  const handRef = useRef<boolean | undefined>(raisedHand);

  useEffect(() => {
    if (prevReadyRef.current === false && ready === true && raisedHand === true) {
      setShowHand(false);
      setTimeout(() => {
        setShowHand(handRef.current);
      }, 2000);
    } else {
      setShowHand(raisedHand);
    }

    prevReadyRef.current = ready;
    handRef.current = raisedHand;
  }, [ready, raisedHand]);

  return (
    <div className={classNames("user-avatar", className, ready && "user-ready")} title={title}>
      {ready && !showHand && <IconCheck className="user-avatar__ready" />}
      {showHand && <RaisedHand className="user-avatar__raised-hand" />}
      <Avatar seed={id} avatar={avatar} className={avatarClassName} />
      {badgeText && <Badge text={badgeText} />}
    </div>
  );
};
