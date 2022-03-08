import "./BoardUsers.scss";
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

export const BoardUsers = () => {
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

  const {me, them} = useAppSelector((state) => ({
    them: state.participants!.others,
    me: state.participants!.self,
  }));

  const usersToShow = them.slice().splice(0, them.length > NUM_OF_DISPLAYED_USERS ? NUM_OF_DISPLAYED_USERS - 1 : NUM_OF_DISPLAYED_USERS);

  return (
    <ul className="board-users">
      {them.length > 0 && (
        <li className="rest-users">
          <div className="rest-users__count">{them.length}</div>
        </li>
      )}
      {usersToShow.map((participant) => (
        <li key={participant.user.id}>
          <UserAvatar id={participant.user.id} ready={participant.ready} name={participant.user.name} />
        </li>
      ))}
      {!!me && <UserAvatar id={me.user.id} ready={me.ready} name={me.user.name} />}
    </ul>
  );
};
