// import { useState } from "react";
// import { useAppSelector } from "store";
// import { Assignee } from "./Assignee";
// import { Autocomplete } from "./Autocomplete";
import {Avatar} from "components/Avatar";
import {useState} from "react";
import {useAppSelector} from "store";
import {Auth} from "types/auth";
import "./Assignees.scss";

// import classNames from "classnames";
// import { useState } from "react";

export enum AnimationState {
  "Opening" = 0,
  "Open" = 1,
  "Closing" = 2,
  "Closed" = 3,
}

export const Assignees = () => {
  // const [showList, setShowList] = useState(false);

  const {me, them} = useAppSelector((state) => ({
    them: state.participants!.others.filter((participant) => participant.connected).slice(),
    me: state.participants!.self,
  }));

  const participants = [me.user, ...them.map((participant) => participant.user)];

  // const ShowParticipantList = () => {
  //     return <>
  //     <input></input>
  //         {participants.map((participant, index) => {
  //             console.log("chek");
  //             return <Assignee participant={participant} index={index}/>
  //         })}
  //     </>
  // }

  // const [inputState, setInputState] = useState<AnimationState>(AnimationState.Closed);
  // const [inputVisible, setInputVisible] = useState(false);
  // const toggleInputVisible = () => {
  //   switch (inputState) {
  //     case AnimationState.Closed:
  //       //input will now expand
  //       setInputVisible(true);
  //       setInputState(AnimationState.Opening);
  //       return;

  //     case AnimationState.Opening:
  //       //input fully expanded
  //       setInputState(AnimationState.Open);
  //       return;

  //     case AnimationState.Open:
  //       //input is now collapsing
  //       setInputState(AnimationState.Closing);
  //       return;

  //     case AnimationState.Closing:
  //       setInputState(AnimationState.Closed);
  //       setInputVisible(false);
  //       return;

  //     default:
  //       setInputState(AnimationState.Closed);
  //       setInputVisible(false);
  //   }
  // }
  const [userInput, setUserInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<Auth[]>([]);

  const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);

  const showSuggestionList = () => {
    setSuggestionsEnabled(true);
  };
  const hideSuggestionList = () => {
    setSuggestionsEnabled(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.currentTarget.value);

    if (userInput === "") setFilteredSuggestions(participants.map((participant) => participant));
    else setFilteredSuggestions(participants.map((participant) => participant).filter((participant) => participant.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1));
    showSuggestionList();
  };

  const onSelectSuggestion = (suggestion: Auth) => {
    setFilteredSuggestions([]);
    console.log(suggestion.name);
    setUserInput(suggestion.name);
  };

  const submitAssignee = () => {
    if (filteredSuggestions.length > 0) {
      if (userInput === filteredSuggestions[0].name) {
        console.log("ich nehme den vorschlag");
        setUserInput(filteredSuggestions[0].name);
        setFilteredSuggestions([]);
        hideSuggestionList();
        return;
      }
    }
    setFilteredSuggestions([]);
    hideSuggestionList();
    console.log("ich willl mein eigenes");
  };

  return (
    <div className="assign-input" onClick={(e) => e.stopPropagation()}>
      <input
        id="assign-input"
        onChange={onInputChange}
        onFocus={onInputChange}
        value={userInput}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitAssignee();
          }
        }}
      />
      {suggestionsEnabled && (
        <ul className="suggestion-list">
          {filteredSuggestions.map((suggestion) => (
              <li id="suggestion-list" onBlur={hideSuggestionList}>
                <button onClick={() => onSelectSuggestion(suggestion)}>
                  <Avatar seed={suggestion.id} avatar={suggestion.avatar} className="assign-avatar" />
                  {suggestion.name}
                </button>
              </li>
            ))}
          <li>displays list</li>
        </ul>
      )}
      {
        // !inputVisible && <div>
        //   <button onClick={toggleInputVisible}>Add</button>
        // </div>
      }

      {
        // inputVisible && <div className={classNames("assign-input", { "expand": inputState === AnimationState.Opening }, { "collapse": inputState === AnimationState.Closing })} onAnimationEnd={toggleInputVisible}>
        //   <input/>
        //   <button onClick={toggleInputVisible}>x</button>
        // </div>
      }

      {
        // <Autocomplete suggestions={participants} />
        // <button title='assign someone' onClick={() => setShowList(!showList)}>Assign</button>
        // {showList && ShowParticipantList()}
      }
    </div>
  );
};

/* <Autocomplete
            multiple
            freeSolo
            readOnly={me.role === "PARTICIPANT"}
            limitTags={3}
            id="tags-filled"
            options={participants.map(p => p.name)}
            renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip participant={participants[index]} />                    
                ))                
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    className='assignees'
                    variant="standard"
                    label="Assignees"
                    placeholder="Assign someone"
                />
            )}

        /> */
