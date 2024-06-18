import {useAppSelector} from "store";
import StanAvatar from "assets/stan/Stan_Avatar.png";
import classNames from "classnames";
import "./UserPill.scss";

type UserPillProps = {
  className: string;
};

export const UserPill = ({className}: UserPillProps) => {
  const myName = useAppSelector((state) => state.auth.user?.name!);

  return (
    <div className={classNames("user-pill", className)}>
      <div className="user-pill__avatar-container">
        <img src={StanAvatar} className="user-pill__avatar" alt="Stan Avatar" />
      </div>
      <div className="user-pill__name">{myName}</div>
    </div>
  );
};
