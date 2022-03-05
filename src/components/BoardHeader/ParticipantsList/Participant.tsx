import {UserAvatar} from "components/BoardUsers";
import {ToggleButton} from "components/ToggleButton";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import "./Participant.scss";
import {TabIndex} from "constants/tabIndex";
import {Participant as ParticipantModel} from "types/participant";

interface ParticipantProps {
  participant: ParticipantModel;
}

export const Participant = ({participant}: ParticipantProps) => {
  const state = useAppSelector((applicationState) => ({
    self: applicationState.participants!.self,
  }));

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
    <li tabIndex={TabIndex.default} className="participant">
      <figure className="participant__avatar-and-name" aria-roledescription="participant">
        <UserAvatar
          ready={participant.ready}
          id={participant.user.id}
          name={participant.user.name}
          className="participant__user-avatar-wrapper"
          avatarClassName="participant__user-avatar"
          badgeText={badgeText}
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
            store.dispatch(Actions.changePermission(participant!.id, val === "moderator"));
          }}
          tabIndex={TabIndex.default}
        />
      )}
    </li>
  );
};
