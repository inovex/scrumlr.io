import {useEffect, useState} from "react";
import {useAppSelector} from "store";
import {Assign} from "types/assign";
import {ReactComponent as SearchIcon} from "assets/icon-search.svg";
import "./Assigning.scss";
import {Badge} from "components/Badge";
import {AssignAvatar} from "./AssignAvatar";

export interface AssigningProps {
  note: string;
}

export const Assigning = (props: AssigningProps) => {
  /* TODO:
      - display avatars
      - make everything look nicer
      - display all possibilities when input is empty
      */
  const {me, them} = useAppSelector((state) => ({
    them: state.participants!.others,
    me: state.participants!.self,
  }));

  const [showList, setShowList] = useState(false);
  const [userInput, setUserInput] = useState("");

  // People that are registered on the Board (connected or not)
  const [onBoardParticipants, setOnBoardParticipants] = useState<Assign[]>([
    {name: me.user.name, note: "", user: me.user},
    ...them.map((participant) => ({name: participant.user.name, note: "", user: participant.user})),
  ]);
  // All People
  const [participants, setParticipants] = useState<Assign[]>([]);

  useEffect(() => {
    // setParticipants([...onBoardParticipants, {name: "debug don", note: "note"}]);
  }, [onBoardParticipants]);

  const toggleAssigneesList = () => {
    // show input field and list
    setShowList(!showList);
  };

  const onSelectParticipant = (participant: Assign) => {
    const index = participants.indexOf(participant);
    const participantsCopy = [...participants];
    participantsCopy[index].note = participantsCopy[index].note === "" ? props.note : "";
    setParticipants(participantsCopy);
  };

  const handleAddExtern = () => {
    // TODO: add button to add participant(e.g for mobile)
    // setParticipants([...participants, {use: userInput, note: props.note}]);
  };

  const deleteME = () => {
    // TODO:
    // this function is just for DEBUG purpose. delete before roll-out
    setOnBoardParticipants([]);
  };

  const drawSuggestions = (participant: Assign) => (
    <li className="participant">
      <AssignAvatar participant={participant} caption />
      <Badge text={participant.note !== "" ? "Assigned" : "Unassigned"} />
      <input type="checkbox" checked={participant.note !== ""} onClick={() => onSelectParticipant(participant)} />
    </li>
  );

  return (
    <div
      className="assing-wrapper"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        onClick={(e) => {
          toggleAssigneesList();
        }}
      >
        {participants
          .filter((participant) => participant.note !== "")
          .slice(0, 2)
          .sort((parA, parB) => parA.name.localeCompare(parB.name))
          .map((participant) => (
            <AssignAvatar participant={participant} />
          ))}
      </button>
      {showList && (
        <aside className="assign" onBlur={toggleAssigneesList}>
          <div className="assign__header">
            <div className="assign__header-title">
              <h4 className="assign__header-text">
                <span>Assign someone</span>
              </h4>
            </div>
            <div className="participants__header-search">
              <SearchIcon className="participants__search_icon" />
              <input
                className="participants__header-input"
                placeholder="placeholder"
                onChange={(event) => setUserInput(event.target.value.trim())}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddExtern();
                    e.stopPropagation();
                  }
                }}
              />
            </div>
          </div>
          <ul className="participants__list">
            <div className="list__header">
              <label>Name</label>
              {(me.role === "MODERATOR" || me.role === "OWNER") && <label>assigned</label>}
            </div>
            {userInput === ""
              ? participants.sort((parA, parB) => parA.name.localeCompare(parB.name)).map((participant) => drawSuggestions(participant))
              : participants
                  .sort((parA, parB) => parA.name.localeCompare(parB.name))
                  .filter((participant) => userInput.split(" ").every((substr) => participant.name.toLowerCase().includes(substr.toLowerCase())))
                  .map((participant) => drawSuggestions(participant))}
            {false && (
              <li>
                <button disabled onClick={deleteME}>
                  dedbug only
                </button>
              </li>
            )}
          </ul>
        </aside>
      )}
    </div>
  );
};
