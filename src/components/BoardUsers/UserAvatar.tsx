import {useEffect, useRef, useState} from "react";
import "./BoardUser.scss";
import classNames from "classnames";
import {ReactComponent as IconCheck} from "assets/icon-check.svg";
import {ReactComponent as RaisedHand} from "assets/icon-hand.svg";
import {Avatar} from "../Avatar";
import {Badge} from "../Badge";

export interface UserAvatarProps {
  className?: string;
  avatarClassName?: string;
  id: string;
  name: string;
  avatar?: string;
  ready?: boolean;
  raisedHand?: boolean;
  badgeText?: string;
}

export const UserAvatar = ({name, badgeText, id, ready, raisedHand, avatar, className, avatarClassName}: UserAvatarProps) => {
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
    <div className={classNames("user-avatar", className, ready && "user-ready")} title={name}>
      {ready && !showHand && <IconCheck className="user-avatar__ready" />}
      {showHand && <RaisedHand className="user-avatar__raised-hand" />}
      {avatar ? <img src={avatar} className={avatarClassName} alt={name} /> : <Avatar seed={id} className={avatarClassName} />}
      {badgeText && <Badge text={badgeText} />}
    </div>
  );
};
