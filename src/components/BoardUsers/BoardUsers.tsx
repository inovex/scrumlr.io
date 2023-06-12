import "./BoardUsers.scss";
import {useAppSelector} from "store";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {ProgressCircle} from "components/BoardHeader/ParticipantsList/ProgressCircle";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
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
  const navigate = useNavigate();
  const {t} = useTranslation();
  // const isOnboarding = window.location.pathname.startsWith("/onboarding");

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

  const usersRest = them.slice();
  const usersToShow = usersRest.splice(0, them.length > NUM_OF_DISPLAYED_USERS ? NUM_OF_DISPLAYED_USERS - 1 : NUM_OF_DISPLAYED_USERS);

  return (
    <div className="board-users">
      {them.length > 0 && (
        <button
          className="board-users__button board-users__button--others"
          aria-label={t("BoardHeader.showParticipants")}
          aria-haspopup
          onClick={() => navigate("settings/participants")}
        >
          {usersRest.length > 0 && (
            <div className="board-users__avatar board-users__avatar--others rest-users">
              <ProgressCircle className="rest-users__readiness" percentage={usersRest.filter((participant) => participant.ready).length / usersRest.length} />
              {usersRest.filter((participant) => participant.ready).length / usersRest.length < 1 ? (
                <span className="rest-users__count">{usersRest.length}</span>
              ) : (
                <CheckIcon className="rest-users__all-ready" />
              )}
            </div>
          )}
          {usersToShow
            .sort((parA, parB) => parA.user.name.localeCompare(parB.user.name))
            .map((participant) => (
              <UserAvatar
                key={participant.user.id}
                id={participant.user.id}
                avatar={participant.user.avatar}
                ready={participant.ready}
                raisedHand={participant.raisedHand}
                title={participant.user.name}
                className="board-users__avatar board-users__avatar--others"
              />
            ))}
        </button>
      )}
      {!!me && (
        <button
          className="board-users__button board-users__button--me"
          onClick={(e) => {
            e.stopPropagation();
            navigate("settings/profile");
          }}
        >
          <UserAvatar id={me.user.id} avatar={me.user.avatar} ready={me.ready} raisedHand={me.raisedHand} title={me.user.name} className="board-users__avatar" />
        </button>
      )}
    </div>
  );
};
