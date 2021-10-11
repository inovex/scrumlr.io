import "./BoardUsers.scss";
import Parse from "parse";
import {useAppSelector} from "store";
import {UserAvatar} from "./UserAvatar";

// it might be a good idea to set this number dynamically (e.g., according to the device: desktop vs. mobile)
const NUM_OF_DISPLAYED_USERS = 4;

export const BoardUsers = () => {
  const users = useAppSelector((state) => state.users.all);
  const currentUser = Parse.User.current();

  const me = users.find((user) => user.id === currentUser!.id);
  const them = users.filter((user) => user.id !== currentUser!.id && user.online);

  const usersToShow = them.splice(0, them.length > NUM_OF_DISPLAYED_USERS ? NUM_OF_DISPLAYED_USERS - 1 : NUM_OF_DISPLAYED_USERS);

  return (
    <ul className="board-users">
      {them.length > 0 && (
        <li className="rest-users">
          <div className="rest-users__count">{them.length}</div>
        </li>
      )}
      {usersToShow.map((user) => (
        <UserAvatar key={user.id} id={user.id} name={user.displayName} />
      ))}
      {!!me && <UserAvatar id={me.id} name={me.displayName} />}
    </ul>
  );
};
