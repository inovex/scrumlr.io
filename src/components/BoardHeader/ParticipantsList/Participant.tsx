import {UserAvatar} from "components/BoardUsers";
import {ToggleButton} from "components/ToggleButton";
import {Participant as ParticipantModel} from "types/participant";
import {Actions} from "store/action";
import {useAppSelector} from "store";
import "./Participant.scss";
import {useDispatch} from "react-redux";

interface ParticipantProps {
  participant: ParticipantModel;
}

export const Participant = ({participant}: ParticipantProps) => {
  const state = useAppSelector((applicationState) => ({
    self: applicationState.participants!.self,
  }));
  const dispatch = useDispatch();

  let badgeText: string;
  if (state.self.user.id === participant.user.id) {
    badgeText = "me";
  } else if (participant.role === "OWNER") {
    badgeText = "owner";
  } else if (participant.role === "MODERATOR") {
    badgeText = "admin";
  } else {
    badgeText = "user";
  }

  return (
    <li className="participant">
      <figure className="participant__avatar-and-name" aria-roledescription="participant">
        <UserAvatar
          ready={participant.ready}
          raisedHand={participant.raisedHand}
          id={participant.user.id}
          name={participant.user.name}
          className="participant__user-avatar-wrapper"
          avatarClassName="participant__user-avatar"
          badgeText={badgeText}
          avatar={participant.user.avatar}
        />
        <figcaption className="participant__name">{participant.user.name}</figcaption>
      </figure>
      {(state.self.role === "OWNER" || state.self.role === "MODERATOR") && (
        <ToggleButton
          className="participant__permission-toggle"
          disabled={state.self.user.id === participant.user.id || participant.role === "OWNER"}
          values={["participant", "moderator"]}
          value={participant.role === "OWNER" || participant.role === "MODERATOR" ? "moderator" : "participant"}
          onToggle={(val: "participant" | "moderator") => {
            dispatch(Actions.changePermission(participant!.user.id, val === "moderator"));
          }}
        />
      )}
    </li>
  );
};
