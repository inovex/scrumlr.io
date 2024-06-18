import {useAppSelector} from "store";
import StanAvatar from "assets/stan/Stan_Avatar.png";
import "./UserPill.scss";

export const UserPill = () => {
  const myName = useAppSelector((state) => state.auth.user?.name!);

  return (
    <div className="user-pill">
      <div className="user-pill__avatar-container">
        <img src={StanAvatar} className="user-pill__avatar" alt="Stan Avatar" />
      </div>
      <div className="user-pill__name">{myName}</div>
    </div>
  );
};
