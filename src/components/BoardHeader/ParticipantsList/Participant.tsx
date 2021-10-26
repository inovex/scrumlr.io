import {UserClientModel} from "types/user";
import {UserAvatar} from "components/BoardUsers";
import {ToggleButton} from "components/ToggleButton";
import Parse from "parse";
import store from "store";
import {ActionFactory} from "store/action";
import "./Participant.scss";

interface ParticipantProps {
  participant: UserClientModel;
  currentUserIsModerator: boolean;
  boardOwner: string;
}

export const Participant = ({participant, currentUserIsModerator, boardOwner}: ParticipantProps) => (
  <li className="participant">
    <figure className="participant__figure" aria-roledescription="participant">
      <UserAvatar id={participant.id} name={participant.displayName} className="participant__user-avatar-wrapper" avatarClassName="participant__user-avatar" />
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
      />
    )}
  </li>
);
