import {Portal} from "components/Portal";
import {useState} from "react";
import {ReactComponent as SearchIcon} from "assets/icon-search.svg";
import {useTranslation} from "react-i18next";
import "./AssigneeList.scss";
import {Assignee} from "types/assignee";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {AssignAvatar} from "./AssignAvatar";

type AssigneeListProps = {
  open: boolean;
  allParticipants: Assignee[];
  assigned: Assignee[];
  noteId: string;
  onClose: () => void;
};

export const AssigneeList = (props: AssigneeListProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [searchString, setSearchString] = useState("");

  if (!props.open || props.allParticipants.length === 0) {
    return null;
  }

  const handleAsigneeClicked = (participant: Assignee) => {
    participant.assigned = !participant.assigned;
    let {assigned} = props;

    if (participant.assigned) {
      assigned.push(participant);
    } else {
      assigned = assigned.filter((a) => a.name != participant.name);
    }
    dispatch(Actions.editNote(props.noteId, {assignee: assigned.map((assignee) => (assignee.id != "" ? assignee.id : assignee.name))}));
  };

  return (
    <Portal
      onClose={() => {
        props.onClose();
        setSearchString("");
      }}
    >
      <aside className="assignees" onClick={(e) => e.stopPropagation()}>
        <div className="assignees__header">
          <div className="assignees__header-title">
            <h4 className="assignees__header-text">
              {/** TODO: Add translation */}
              <span>Assign someone</span>
            </h4>
          </div>
          <div className="assignees__header-search">
            <SearchIcon className="assignees__search_icon" />
            <input className="assignees__header-input" placeholder={t("ParticipantsList.search")} onChange={(event) => setSearchString(event.target.value.trim().toLowerCase())} />
          </div>
        </div>
        <ul className="assignees__list">
          <div className="list__header">
            {/* TODO:provide translation */}
            <label>Name</label>
            <label>Assigned</label>
          </div>
          {props.allParticipants.length > 0 &&
            props.allParticipants
              .sort((parA, parB) => parA.name.localeCompare(parB.name)) // Sort participants by name
              .filter((participant) => searchString.split(" ").every((substr) => participant.name.toLowerCase().includes(substr)))
              .map((participant) => (
                <li className="assignees__list-element">
                  <button className="assignees__list-element__button" onClick={() => handleAsigneeClicked(participant)}>
                    <AssignAvatar participant={participant} />
                    <input type="checkbox" checked={participant.assigned} />
                  </button>
                </li>
              ))}
          <li>
            <button className="assignees__list-element__button" onClick={() => handleAsigneeClicked({name: searchString, id: "", assigned: false})}>
              {/* provide translation */}
              <label>+ Add custom name</label>
            </button>
          </li>
        </ul>
      </aside>
    </Portal>
  );
};
