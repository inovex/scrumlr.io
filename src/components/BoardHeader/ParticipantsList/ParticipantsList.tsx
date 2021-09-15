import Portal from "components/Portal/Portal";
import {useState} from "react";
import {UserClientModel} from "types/user";
import avatar from "assets/avatar.png";
import "./ParticipantsList.scss";
import {ToggleButton} from "components/ToggleButton";
import store from "store";
import Parse from "parse";
import {ActionFactory} from "store/action";
import {ReactComponent as SearchIcon} from "assets/icon-search.svg";

type ParticipantsListProps = {
  open: boolean;
  onClose: () => void;
  participants: Array<UserClientModel>;
  currentUserIsModerator: boolean;
};

export const ParticipantsList = (props: ParticipantsListProps) => {
  const [searchString, setSearchString] = useState("");

  if (!props.open) {
    return null;
  }

  return (
    <Portal onClose={props.onClose} darkBackground={false}>
      <aside className="participants">
        <header className="participants__header">
          <h4>Board Participants ({props.participants.length})</h4>
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
              <li>
                <figure>
                  <img src={avatar} />
                  <figcaption>{participant.displayName}</figcaption>
                </figure>
                {/* Show the permission toggle if the current user is moderator and it's not the toggle for the user himself */}
                {props.currentUserIsModerator && (
                  <ToggleButton
                    className="participant__permission-toggle"
                    disabled={Parse.User.current()?.id === participant.id}
                    values={["participant", "moderator"]}
                    defaultValue={participant.admin ? "moderator" : "participant"}
                    onClick={(val: "participant" | "moderator") => {
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
