import {useAppSelector} from "store";
import StanAvatar from "assets/stan/Stan_Avatar.png";
import classNames from "classnames";
import "./UserPill.scss";

type UserPillProps = {
  className?: string;
  disabled?: boolean;
};

export const UserPill = (props: UserPillProps) => {
  const myName = useAppSelector((state) => state.auth.user?.name!);

  return (
    <button className={classNames("user-pill", props.className)} disabled={props.disabled} tabIndex={0}>
      <div className="user-pill__container">
        <div className="user-pill__avatar-container">
          <img src={StanAvatar} className="user-pill__avatar" alt="Stan Avatar" />
          <div className="user-pill__avatar-overlay" />
        </div>
        <div className="user-pill__name">{myName}</div>
      </div>
    </button>
  );
};
