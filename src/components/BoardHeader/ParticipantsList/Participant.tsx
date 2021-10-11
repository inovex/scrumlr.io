import {UserClientModel} from "types/user";
import {UserAvatar} from "components/BoardUsers";
import {ToggleButton} from "components/ToggleButton";
import Parse from "parse";
import store from "store";
import {ActionFactory} from "store/action";
import {FunctionComponent} from "react";

interface ParticipantProps {
  participant: UserClientModel;
  currentUserIsModerator: boolean;
  boardOwner: string;
}

export const Participant: FunctionComponent<ParticipantProps> = ({participant, currentUserIsModerator, boardOwner}) => (
  <li className="participants__list-item" key={participant!.id}>
    <UserAvatar key={participant!.id} id={participant!.id} name={participant!.displayName} group="participants" />
    {/* Show the permission toggle if the current user is moderator */}
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
