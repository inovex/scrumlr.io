import Portal from "components/Portal/Portal";
import {useState} from "react";
import {UserClientModel} from "types/user";
import "./ParticipantsList.scss";
import {ToggleButton} from "components/ToggleButton";
import store, {useAppSelector} from "store";
import Parse from "parse";
import {ActionFactory} from "store/action";
import {ReactComponent as SearchIcon} from "assets/icon-search.svg";
import UserAvatar from "../../BoardUsers/UserAvatar";

type ParticipantsListProps = {
  open: boolean;
  onClose: () => void;
  participants: Array<UserClientModel>;
  currentUserIsModerator: boolean;
};

export const ParticipantsList = (props: ParticipantsListProps) => {
  const [searchString, setSearchString] = useState("");
  const boardOwner = useAppSelector((state) => state.board.data?.owner);

  if (!props.open) {
    return null;
  }

  return (
    <Portal onClose={props.onClose} darkBackground={false}>
      <aside className="participants">
        <header className="participants__header">
          <h4>Participants ({props.participants.length})</h4>
          <SearchIcon className="header__icon" />
          <input placeholder="Search" onChange={(event) => setSearchString(event.target.value.trim().toLowerCase())} />
        </header>
        <ul className="participants__list">
          <div className="list__header">
            <label>Name</label>
            {props.currentUserIsModerator && <label>Admin</label>}
          </div>
          {props.participants
            .sort((parA, parB) => parA.displayName.localeCompare(parB.displayName)) // Sort participants by name
            .filter((participant) => searchString.split(" ").every((substr) => participant.displayName.toLowerCase().includes(substr)))
            .map((participant) => (
              <li key={participant.id}>
                <UserAvatar key={participant.id} id={participant.id} name={participant.displayName} group="participants" />
                {/* Show the permission toggle if the current user is moderator */}
                {props.currentUserIsModerator && (
                  <ToggleButton
                    className="participant__permission-toggle"
                    disabled={Parse.User.current()?.id === participant.id || participant.id === boardOwner}
                    values={["participant", "moderator"]}
                    value={participant.admin ? "moderator" : "participant"}
                    onToggle={(val: "participant" | "moderator") => {
                      store.dispatch(ActionFactory.changePermission(participant.id, val === "moderator"));
                    }}
                  />
                )}
              </li>
            ))}
        </ul>
      </aside>
    </Portal>
  );
};
