import {useAppSelector} from "store";
import {useNavigate} from "react-router";
import StanAvatar from "assets/stan/Stan_Avatar.png";
import classNames from "classnames";
import {Avatar} from "components/Avatar";
import "./UserPill.scss";

type UserPillProps = {
  className?: string;
  disabled?: boolean;
  locationPrefix?: string;
};

export const UserPill = (props: UserPillProps) => {
  const navigate = useNavigate();
  const me = useAppSelector((state) => state.auth.user)!; // TODO omit this after #4270, since seed is optional then
  const myName = useAppSelector((state) => state.auth.user?.name);
  const avatar = useAppSelector((state) => state.auth.user?.avatar);

  const openSettings = () => {
    navigate(`${props.locationPrefix ?? ""}/settings/profile`);
  };

  const renderAvatar = () =>
    avatar ? (
      <Avatar seed={me.id} avatar={avatar} className={classNames("user-pill__avatar", "user-pill__avatar--own")} />
    ) : (
      <img src={StanAvatar} className={classNames("user-pill__avatar", "user-pill__avatar--stan")} alt="Stan Avatar" />
    );

  return (
    <button className={classNames("user-pill", props.className)} disabled={props.disabled} tabIndex={0} onClick={openSettings}>
      <div className="user-pill__container">
        <div className="user-pill__avatar-container">
          {renderAvatar()}
          <div className="user-pill__avatar-overlay" />
        </div>
        <div className="user-pill__name">{myName}</div>
      </div>
    </button>
  );
};
