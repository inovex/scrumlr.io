import "./BoardUsers.scss";
import {useAppSelector} from "store";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {TabIndex} from "constants/tabIndex";
import {ParticipantsList} from "components/BoardHeader/ParticipantsList";
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
  const [showParticipants, setShowParticipants] = useState(false);
  const navigate = useNavigate();
  const {t} = useTranslation();

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
    them: state.participants!.others.filter((participant) => participant.connected),
    me: state.participants!.self,
  }));

  const usersToShow = them.slice().splice(0, them.length > NUM_OF_DISPLAYED_USERS ? NUM_OF_DISPLAYED_USERS - 1 : NUM_OF_DISPLAYED_USERS);

  return (
    <div>
      <ul className="board-users">
        {!!me && (
          <li className="board-users__my-avatar">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("settings/profile");
              }}
              tabIndex={TabIndex.BoardHeader + 3}
            >
              <UserAvatar id={me.user.id} avatar={me.user.avatar} ready={me.ready} raisedHand={me.raisedHand} name={me.user.name} className="board-users__avatar" />
            </button>
          </li>
        )}
        {them.length > 0 && (
          <button
            className="board-users__other-avatars"
            aria-label={t("BoardHeader.showParticipants")}
            tabIndex={TabIndex.BoardHeader + 2}
            aria-haspopup
            aria-pressed={showParticipants}
            onClick={() => setShowParticipants(!showParticipants)}
          >
            {them.length > usersToShow.length && (
              <li className="rest-users">
                <div className="rest-users__count">{them.length - usersToShow.length}</div>
              </li>
            )}
            {usersToShow.map((participant) => (
              <li key={participant.user.id}>
                <UserAvatar
                  id={participant.user.id}
                  avatar={participant.user.avatar}
                  ready={participant.ready}
                  raisedHand={participant.raisedHand}
                  name={participant.user.name}
                  className="board-users__avatar"
                />
              </li>
            ))}
          </button>
        )}
      </ul>
      <ParticipantsList open={showParticipants} onClose={() => setShowParticipants(false)} />
    </div>
  );
};
