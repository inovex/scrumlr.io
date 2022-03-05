import {UserAvatar} from "components/BoardUsers";
import {ToggleButton} from "components/ToggleButton";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import "./Participant.scss";
import {TabIndex} from "constants/tabIndex";
import {Participant as ParticipantModel} from "types/participant";

interface ParticipantProps {
  participant: ParticipantModel;
  currentUserIsModerator: boolean;
  boardOwner: string;
}

export const Participant = ({participant, currentUserIsModerator, boardOwner}: ParticipantProps) => {
  const state = useAppSelector((applicationState) => ({
    participants: applicationState.participants,
  }));

  let badgeText: string;
  if (state.participants?.self.user.id === participant.user.id) {
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
      {currentUserIsModerator && (
        <ToggleButton
          className="participant__permission-toggle"
          disabled={Parse.User.current()?.id === participant.user.id || participant!.id === boardOwner}
          values={["participant", "moderator"]}
          value={participant!.admin ? "moderator" : "participant"}
          onToggle={(val: "participant" | "moderator") => {
            store.dispatch(ActionFactory.changePermission(participant!.id, val === "moderator"));
          }}
          tabIndex={TabIndex.default}
        />
      )}
    </li>
  );
};
