import Portal from "components/Portal/Portal";
import {useState} from "react";
import {UserClientModel} from "types/user";
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
          <input placeholder="Search Participant" onChange={(event) => setSearchString(event.target.value.trim())} />
        </header>

        <ul className="participants__list">
          {props.participants
            .filter((participant) => searchString.split(" ").every((substr) => participant.displayName.includes(substr)))
            .map((participant) => (
              <li>
                <figure>
                  <img src="https://openclipart.org/image/800px/215813" />
                  <figcaption>{participant.displayName}</figcaption>
                </figure>
              </li>
            ))}
        </ul>
      </aside>
    </Portal>
  );
};
