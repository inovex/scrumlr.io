import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {useAppSelector} from "store";
import "./Assigning.scss";
import {useEffect, useState} from "react";
import {Assignee} from "types/assignee";
import {DotButton} from "components/DotButton";
import {Avatar} from "components/Avatar";
import {ExternalAvatar} from "./ExternalAvatar";
import {AssigneeList} from "./AssigneeList";

export interface BasicAssignProps {
  noteId: string;
}

export const Assigning = ({noteId}: BasicAssignProps) => {
  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));
  const participantUsers = useAppSelector((state) => [...state.participants!.others.map((p) => p.user), state.participants!.self.user]);
  const [allParticipants, setAllParticipants] = useState<Assignee[]>([]);
  const [assigned, setAssigned] = useState<Assignee[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!note) {
      return;
    }

    const assign: Assignee[] = [];
    const all: Assignee[] = [];
    participantUsers.map((p) => all.push({name: p.name, id: p.id, assigned: false, avatar: p.avatar}));

    /*
    1.are there any people assigned?
    2.if so, check if their names match a users id 
    (i made it so that when you assign someone who has an id, the id is sent to the server instead of the name,
       that way i just have to search the participants for the id and have all the information about this user)
    3.if it is a "onBoard"-user fetch the name and avatar and set it to assigned in all users
      if its an external, push it to all participants and add it as an assigned user
    */
    if (note.assignee.length > 0) {
      note?.assignee.map((name) => {
        if (name !== "") {
          const index = participantUsers.map((participant) => participant.id).indexOf(name);
          if (index >= 0) {
            assign.push({name: participantUsers[index].name, id: participantUsers[index].id, assigned: true, avatar: participantUsers[index].avatar});
            all[index].assigned = true;
          } else {
            assign.push({name, id: "", assigned: true});
            all.push({name, id: "", assigned: true});
          }
        }
      });
    }
    setAssigned(assign);
    setAllParticipants(all);
    console.log(note.text, assigned);
  }, [note]);

  return (
    <div className="assigning">
      {
        // check if no one is assigned. if so, show +assign  icon, else show assigned avatars
        // TODO: Add a popup on hover with the participants name
        assigned.length === 0 ? (
          <DotButton className="vote-button-add" onClick={() => setExpanded(!expanded)} disabled={false}>
            <PlusIcon className="vote-button-add__icon" />
          </DotButton>
        ) : (
          assigned.map((assignee) => assignee.id !== "" ? (
              <button
                className="assigning__avatar-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                <Avatar seed={assignee.id!} avatar={assignee.avatar} className="assigning__avatar" />
              </button>
            ) : (
              <button
                className="assigning__avatar-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                <ExternalAvatar name={assignee.name} className="assigning__avatar-external" />
              </button>
            ))
        )
      }
      <AssigneeList open={expanded} onClose={() => setExpanded(false)} allParticipants={allParticipants} noteId={note!.id} assigned={assigned} />
    </div>
  );
};

{
  /* <div className="assigning">

<button title="toggle-assigning" onClick={() => setExpanded(!expanded)}>
  {
    //check if no one is assigned. if so, show +assign  icon, else show assigned avatars
    //TODO: Add a popup on hover with the participants name
    assigned.length === 0
      ? <ExternalAvatar name="+" />
      : assigned.map(assignee => assignee.id != ""
        ? <Avatar seed={assignee.id!} avatar={assignee.avatar} className="assign-avatar" />
        : <ExternalAvatar name={assignee.name} />)
  }
</button>
{expanded&&
<input/>}
</div> */
}
//   <div onClick={(e) => {e.stopPropagation;e.preventDefault}}>
//   <button onClick={onSubmitHandler}>submit</button>
//   <input
//     type="text"
//     onChange={(e) => {
//       console.log(e.target.value);
//       setUserInput(e.target.value);
//     }}
//     value={note?.assignee ? note?.assignee[0] : userInput}
//   />
// </div>
