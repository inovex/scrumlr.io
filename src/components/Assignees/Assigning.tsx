import {useEffect, useState} from "react";
import {useAppSelector} from "store";
import {Assignee} from "types/assignee";
import "./Assigning.scss";

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
  const [onBoardParticipants, setOnBoardParticipants] = useState<Assignee[]>([
    {name: me.user.name, note: "", user: me.user},
    ...them.map((participant) => ({name: participant.user.name, note: "", user: participant.user})),
  ]);
  // People that are strangers to the board so we dont have an id etc.
  const [externalParticipants, setExternalParticipants] = useState<Assignee[]>([]);
  // All People
  const [participants, setParticipants] = useState<Assignee[]>([]);
  // A filtered version of All People based on the userInput
  const [filteredSuggestions, setFilteredSuggestions] = useState<Assignee[]>([]);

  useEffect(() => {
    setParticipants([...onBoardParticipants, ...externalParticipants]);
  }, [onBoardParticipants, externalParticipants]);

  const addExternalParticipant = (participant: Assignee) => {
    setExternalParticipants([...externalParticipants, participant]);
  };

  // const removeExternalParticipant = (participant: Assignee) => {
  //     setExternalParticipants(externalParticipants.filter(external => external !== participant));
  // }

  const toggleAssigneesList = () => {
    // show input field and list
    setShowList(!showList);
  };

  const handleChangeUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // user is typing name
    setUserInput(e.target.value);
    setFilteredSuggestions(participants.map((participant) => participant).filter((participant) => participant.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1));
  };

  const handleUserSubmit = () => {
    // user submitted a name by hitting enter
    addExternalParticipant({name: userInput, note: props.note});
    setUserInput("");
  };

  const handleSelectSuggestion = (suggestion: Assignee) => {
    const matchingParticcipants = participants.filter((p) => p === suggestion);
    if (matchingParticcipants.length !== 1) return; // this should not happen

    // make changes
    const selectedParticipant = matchingParticcipants[0];
    const index = participants.indexOf(selectedParticipant);
    selectedParticipant.note = selectedParticipant.note === "" ? props.note : "";

    // apply changes
    const participantsCopy = participants;
    participantsCopy[index] = selectedParticipant;
    setParticipants(participantsCopy);
  };

  const deleteME = () => {
    setOnBoardParticipants([]);
  };

  return (
    <div className="assing-wrapper">
      <button
        id="manage-assignees"
        onClick={(e) => {
          e.stopPropagation();
          toggleAssigneesList();
        }}
      >
        {/* cycle through all assignees and ddisplay first 2 or 3 to show avatar */}
      </button>

      {showList && (
        <div id="input-list-wrapper" onBlur={toggleAssigneesList}>
          <input
            value={userInput}
            onChange={handleChangeUserInput}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUserSubmit();
              }
            }}
          />
          <ul>
            {filteredSuggestions.map((suggestion) => (
              <li>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSuggestion(suggestion);
                  }}
                >
                  <input readOnly type="checkbox" checked={suggestion.note !== ""} />
                  {suggestion.name}
                </button>
              </li>
            ))}
            {/* cycle through all assigned first , then everyone else */}
            <li>
              <button onClick={deleteME}>dedbug only</button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
