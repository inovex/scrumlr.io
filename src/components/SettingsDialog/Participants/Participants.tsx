import {useState} from "react";
import {useDispatch} from "react-redux";
import {useAppSelector} from "store";
import {Actions} from "store/action";

export const Participants = () => {
  const dispatch = useDispatch();
  const [permissionFilter] = useState<"ALL" | "OWNER" | "MODERATOR" | "PARTICIPANT">("ALL");
  const [onlineFilter, setOnlineFilter] = useState<boolean>(true);

  const participants = useAppSelector((state) => [state.participants!.self, ...(state.participants?.others ?? [])]);

  return (
    <section className="participants">
      <input className="participants__search-input" />

      <button aria-label="" className="" onClick={() => setOnlineFilter((o) => !o)}>
        {onlineFilter ? "Online" : "Offline"}
      </button>

      <ul className="participants__list">
        {participants
          .filter((participant) => participant.role === permissionFilter || permissionFilter === "ALL")
          .filter((participant) => participant.connected === onlineFilter)
          .map((participant) => (
            <li key={participant.user.id}>
              <span>{participant.user.name}</span>
              {participant.role === "OWNER" ? (
                <span>Owner</span>
              ) : (
                <>
                  <button onClick={() => dispatch(Actions.changePermission(participant.user.id, true))}>Moderator</button>
                  <button onClick={() => dispatch(Actions.changePermission(participant.user.id, false))}>Participant</button>
                </>
              )}
            </li>
          ))}
      </ul>
    </section>
  );
};
