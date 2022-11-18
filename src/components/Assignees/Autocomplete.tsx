import {useState} from "react";
import {Auth} from "types/auth";
import "./Autocomplete.scss";

export interface AutocompleteProps {
  suggestions: Auth[];
}

export const Autocomplete = (props: AutocompleteProps) => {
  const [activeSuggesttion, setActiveSuggestion] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userInput, setUserInput] = useState("");

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.currentTarget.value);
    setActiveSuggestion(0);
    if (userInput === "") setFilteredSuggestions(props.suggestions.map((suggestion) => suggestion.name));
    else setFilteredSuggestions(props.suggestions.map((suggestion) => suggestion.name).filter((suggestion) => suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1));
    setShowSuggestions(true);
  };

  const onSelectSuggestion = (suggestion: string) => {
    setActiveSuggestion(0);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    console.log(suggestion);
    setUserInput(suggestion);
  };

  const submitAssignee = () => {
    // dunno if the order is good
    setActiveSuggestion(0);
    setFilteredSuggestions([]);
    setShowSuggestions(false);

    if (filteredSuggestions.length > 0) {
      if (userInput === filteredSuggestions[activeSuggesttion]) {
        console.log("ich nehme den vorschlag");
        return;
      }
    }
    console.log("ich willl mein eigenes");
  };

  return (
    <div className="input-container">
      <input
        type="text"
        onChange={onInputChange}
        value={userInput}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitAssignee();
          }
        }}
      />
      {showSuggestions && (
        <ul>
          {filteredSuggestions.map((suggestion) => (
            <button onClick={() => onSelectSuggestion(suggestion)}>{suggestion}</button>
          ))}
        </ul>
      )}
    </div>
  );
};
