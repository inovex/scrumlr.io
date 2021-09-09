import Portal from "components/Portal/Portal";
import {useState} from "react";
import {UserClientModel} from "types/user";
import avatar from "assets/avatar.png";
import "./ParticipantsList.scss";

type ParticipantsListProps = {
  open: boolean;
  onClose: () => void;
  participants: Array<UserClientModel>;
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
          <h1>Board Participants</h1>
          <input placeholder="Search Participant" onChange={(event) => setSearchString(event.target.value.trim().toLowerCase())} />
        </header>

        <ul className="participants__list">
          {props.participants
            .filter((participant) => searchString.split(" ").every((substr) => participant.displayName.toLowerCase().includes(substr)))
            .map((participant) => (
              <li>
                <figure>
                  <img src={avatar} />
                  <figcaption>{participant.displayName}</figcaption>
                </figure>
              </li>
            ))}
        </ul>
      </aside>
    </Portal>
  );
};
