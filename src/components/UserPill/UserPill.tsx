import {useAppSelector} from "store";
import "./UserPill.scss";

export const UserPill = () => {
  const myName = useAppSelector((state) => state.auth.user?.name!);

  return (
    <div className="user-pill">
      <div>avatar</div>
      <div className="user-pill__name">{myName}</div>
    </div>
  );
};
