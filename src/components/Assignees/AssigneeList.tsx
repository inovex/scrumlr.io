import {Portal} from "components/Portal";
import {useState} from "react";
import {ReactComponent as SearchIcon} from "assets/icon-search.svg";
import {useTranslation} from "react-i18next";
import "./AssigneeList.scss";
import {Assignee} from "types/assignee";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {useAppSelector} from "store";
import {Participant} from "types/participant";
import {AssignAvatar} from "./AssignAvatar";

type AssigneeListProps = {
  open: boolean;
  assigned: Assignee[];
  noteId: string;
  coords: {top: number; left: number};
  onClose: () => void;
};

export const AssigneeList = (props: AssigneeListProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [searchString, setSearchString] = useState("");

  const {me, all}: {me: Participant; all: Assignee[]} = useAppSelector((state) => ({
    me: state.participants!.self,
    /*
      >>this comment is supposed to explain what happens in the declaration of 'all' below
      1.collect all the 'others' and 'me' (now we have all the on board users)
      2.map them to be of type 'Assignee' 
      3.delete them(filter) who are also in the assigned list(the assigned list contains all the assigned users on Board users and external users) 
      4.right now we only have on Board users an since we deleted those who are assigned we just have to append the  assignee list to our current list and voila  we're done
    */
    all: [
      ...[...state.participants!.others.map((p) => p.user), state.participants!.self.user] // 1
        .map((p) => ({name: p.name, id: p.id, assigned: false, avatar: p.avatar} as Assignee)) // 2
        .filter((p) => props.assigned.map((a) => a.id).indexOf(p.id) === -1), // 3
      ...props.assigned, // 4
    ],
  }));

  if (!props.open) {
    return null;
  }

  const handleAsigneeClicked = (participant: Assignee) => {
    console.log(props.assigned);
    participant.assigned = !participant.assigned;
    let {assigned} = props;

    if (participant.assigned) {
      assigned.push(participant);
    } else {
      assigned = assigned.filter((a) => a.name !== participant.name);
    }
    dispatch(Actions.editNote(props.noteId, {assignee: assigned.map((assignee) => (assignee.id !== "" ? assignee.id : assignee.name))}));
    setSearchString("");
  };

  return (
    <Portal
      onClose={() => {
        props.onClose();
        setSearchString("");
      }}
    >
      <aside
        className="assignees"
        onClick={(e) => e.stopPropagation()}
        style={{
          left: `${props.coords.left - 75}px`,
          top: `${props.coords.top + 40}px`,
        }}
      >
        <div className="assignees__header">
          <div className="assignees__header-title">
            <h4 className="assignees__header-text">
              <span>{t("assigning.header")}</span>
            </h4>
          </div>
          <div className="assignees__header-search">
            <SearchIcon className="assignees__search_icon" />
            <input
              className="assignees__header-input"
              placeholder={t("assigning.placeholder")}
              onChange={(event) => setSearchString(event.target.value.trim())}
              value={searchString}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAsigneeClicked({name: searchString, id: "", assigned: false});
                }
              }}
            />
          </div>
        </div>
        <ul className="assignees__list">
          <div className="list__header">
            <label>{t("assigning.listHeader01")}</label>
            <label>{t("assigning.listHeader02")}</label>
          </div>
          {all.length > 0 &&
            all
              .sort((parA, parB) => parA.name.localeCompare(parB.name)) // Sort participants by name
              .filter((participant) =>
                searchString
                  .toLocaleLowerCase()
                  .split(" ")
                  .every((substr) => participant.name.toLowerCase().includes(substr))
              )
              .map((participant) => (
                <li className="assignees__list-element">
                  <button className="assignees__list-element__button" onClick={() => handleAsigneeClicked(participant)} disabled={me.role === "PARTICIPANT"}>
                    <AssignAvatar participant={participant} />
                    <input type="checkbox" checked={participant.assigned} readOnly />
                  </button>
                </li>
              ))}
          <li>
            <button
              className="assignees__list-element__button"
              onClick={() => handleAsigneeClicked({name: searchString, id: "", assigned: false})}
              disabled={me.role === "PARTICIPANT"}
            >
              <label>+ {t("assigning.addCustomName")}</label>
            </button>
          </li>
        </ul>
      </aside>
    </Portal>
  );
};
