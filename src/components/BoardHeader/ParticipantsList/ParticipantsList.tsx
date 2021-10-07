import Portal from "components/Portal/Portal";
import {useState} from "react";
import {UserClientModel} from "types/user";
import "./ParticipantsList.scss";
import {ToggleButton} from "components/ToggleButton";
import store, {useAppSelector} from "store";
import Parse from "parse";
import {ActionFactory} from "store/action";
import {ReactComponent as SearchIcon} from "assets/icon-search.svg";
import UserAvatar from "components/BoardUsers/UserAvatar";

type ParticipantsListProps = {
  open: boolean;
  onClose: () => void;
  participants: Array<UserClientModel>;
  currentUserIsModerator: boolean;
};

export const ParticipantsList = (props: ParticipantsListProps) => {
  const [searchString, setSearchString] = useState("");
  const boardOwner = useAppSelector((state) => state.board.data?.owner);

  const users = useAppSelector((state) => state.users.all);
  const currentUser = Parse.User.current();
  const me = users.find((user) => user.id === currentUser!.id);
  const them = users.filter((user) => user.id !== currentUser!.id && user.online);

  if (!props.open) {
    return null;
  }

  return (
    <Portal onClose={props.onClose} darkBackground={false}>
      <aside className="participants">
        <header className="participants__header">
          <div className="participants__header-title">
            <h4 className="participants__header-text">Participants</h4>
            <span className="participants__header-number"> {props.participants.length} </span>
          </div>
          <SearchIcon className="header__icon" />
          <input className="participants__header-input" placeholder="Search" onChange={(event) => setSearchString(event.target.value.trim().toLowerCase())} />
        </header>
        <ul className="participants__list">
          <div className="list__header">
            <label>Name</label>
            {props.currentUserIsModerator && <label>Admin</label>}
          </div>

          <li className="participants__list-item" key={me!.id}>
            <UserAvatar key={me!.id} id={me!.id} name={me!.displayName} group="participants" />
            {/* Show the permission toggle if the current user is moderator */}
            {props.currentUserIsModerator && (
              <ToggleButton
                className="participant__permission-toggle"
                disabled={Parse.User.current()?.id === me!.id || me!.id === boardOwner}
                values={["participant", "moderator"]}
                value={me!.admin ? "moderator" : "participant"}
                onToggle={(val: "participant" | "moderator") => {
                  store.dispatch(ActionFactory.changePermission(me!.id, val === "moderator"));
                }}
              />
            )}
          </li>

          {them.length > 0 &&
            them
              .sort((parA, parB) => parA.displayName.localeCompare(parB.displayName)) // Sort participants by name
              .filter((participant) => searchString.split(" ").every((substr) => participant.displayName.toLowerCase().includes(substr)))
              .map((participant) => (
                <li className="participants__list-item" key={participant.id}>
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
