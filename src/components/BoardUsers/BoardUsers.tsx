import "./BoardUsers.scss";
import Parse from "parse";
import {useAppSelector} from "store";
import {useEffect, useState} from "react";
import {UserAvatar} from "./UserAvatar";

const getWindowDimensions = () => {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
};

export var BoardUsers = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let NUM_OF_DISPLAYED_USERS;
  if (windowDimensions.width < 768) {
    NUM_OF_DISPLAYED_USERS = 1;
  } else if (windowDimensions.width < 1024) {
    NUM_OF_DISPLAYED_USERS = 2;
  } else {
    NUM_OF_DISPLAYED_USERS = 4;
  }

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
        <li key={user.id}>
          <UserAvatar id={user.id} ready={user.ready} name={user.displayName} />
        </li>
      ))}
      {!!me && <UserAvatar id={me.id} ready={me.ready} name={me.displayName} />}
    </ul>
  );
};
