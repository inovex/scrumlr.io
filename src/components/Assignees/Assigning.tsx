import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {useAppSelector} from "store";
import "./Assigning.scss";
import {useEffect, useState} from "react";
import {Assignee} from "types/assignee";
import {Avatar} from "components/Avatar";
import _ from "underscore";
import {ExternalAvatar} from "./ExternalAvatar";
import {AssigneeList} from "./AssigneeList";

export interface BasicAssignProps {
  noteId: string;
}

/*
  Assignings (this file) purpose is to render the capsule and assign button on the note.
  it also controls wether to show or hide the AssigneeList.
*/
export const Assigning = ({noteId}: BasicAssignProps) => {
  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));
  const participantUsers = useAppSelector((state) => [...state.participants!.others.map((p) => p.user), state.participants!.self.user]);
  const [assigned, setAssigned] = useState<Assignee[]>([]);
  const [expanded, setExpanded] = useState(false);
  /*
    what are those x- and y-Coord for youre asking?
    well since I am using a Portal to display the Assigneelist on top of all the Notes,
    the lists Parent is not the note, wich made positioning quite hard/impossible for me.
    Thats why i'm taking the x and y coordinate from the assign-button on the note to position
    the list manually. now you're probably asking if this is the best solution? -propably not.
  */
  const [xCoord, setXCoord] = useState(0);
  const [yCoord, setYCoord] = useState(0);

  const state = useAppSelector(
    (applicationState) => ({
      activeVoting: Boolean(applicationState.votings.open),
    }),
    _.isEqual
  );

  useEffect(() => {});

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
    if (note.assignee)
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
          return null;
        });
      }
    setAssigned(assign);
  }, [note]);

  return (
    <div className="assigning" onClick={(e) => e.stopPropagation()}>
      {!state.activeVoting && (
        <button
          className="assining__pill"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setXCoord(rect.left);
            setYCoord(rect.top);

            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <label className="assining__pill-assign-label">@</label>
          {
            // check if no one is assigned. if so, show the "+"-icon, else show assigned avatars
            assigned.length === 0 ? (
              <div className="assining__add-button-plus">
                <PlusIcon className="assining__add-button-plus__icon" />
              </div>
            ) : (
              <div className="assigning__avatar-container">
                {assigned
                  .map((x) => x)
                  .splice(0, assigned.length > 3 ? 2 : 3)
                  .map((assignee) =>
                    assignee.id !== "" ? (
                      <Avatar seed={assignee.id!} avatar={assignee.avatar} className="assigning__avatar-board-user avatar-on-note" />
                    ) : (
                      <ExternalAvatar name={assignee.name} className="assigning__avatar-external avatar-on-note" />
                    )
                  )}
                {assigned.length > 3 ? (
                  <div>
                    <label>+{assigned.length - 2}</label>
                  </div>
                ) : null}
              </div>
            )
          }
        </button>
      )}
      <AssigneeList open={expanded} onClose={() => setExpanded(false)} noteId={note!.id} coords={{top: yCoord, left: xCoord}} assigned={assigned} />
    </div>
  );
};
