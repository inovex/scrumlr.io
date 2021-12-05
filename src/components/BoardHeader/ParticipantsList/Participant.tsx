import {UserClientModel} from "types/user";
import {UserAvatar} from "components/BoardUsers";
import {ToggleButton} from "components/ToggleButton";
import Parse from "parse";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import "./Participant.scss";
import {TabIndex} from "constants/tabIndex";

interface ParticipantProps {
  participant: UserClientModel;
  currentUserIsModerator: boolean;
  boardOwner: string;
}

export var Participant = ({participant, currentUserIsModerator, boardOwner}: ParticipantProps) => {
  const state = useAppSelector((applicationState) => ({
    users: applicationState.users,
  }));

  let badgeText = "";
  if (Parse.User.current()?.id === participant!.id) {
    badgeText = "me";
  } else if (participant!.id === boardOwner) {
    badgeText = "owner";
  } else if (state.users.admins.find((user) => user.id === participant!.id) !== undefined) {
    badgeText = "admin";
  } else {
    badgeText = "user";
  }

  return (
    <li tabIndex={TabIndex.default} className="participant">
      <figure className="participant__avatar-and-name" aria-roledescription="participant">
        <UserAvatar
          ready={participant.ready}
          id={participant.id}
          name={participant.displayName}
          className="participant__user-avatar-wrapper"
          avatarClassName="participant__user-avatar"
          badgeText={badgeText}
        />
        <figcaption className="participant__name">{participant.displayName}</figcaption>
      </figure>
      {currentUserIsModerator && (
        <ToggleButton
          className="participant__permission-toggle"
          disabled={Parse.User.current()?.id === participant!.id || participant!.id === boardOwner}
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
