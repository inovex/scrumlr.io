import {useState} from "react";
import {useAppSelector} from "store";
import _ from "underscore";
import "./Assignments.scss";
import {ReactComponent as AssignmentIcon} from "assets/icon-assignment.svg";

type AssignmentsProps = {
  noteId: string;
};

export const Assignments = (props: AssignmentsProps) => {
  const assignments = useAppSelector((state) => state.assignments.filter((a) => a.note === props.noteId), _.isEqual);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <details className="assignments">
      <summary
        onClick={(e) => {
          e.stopPropagation();
          setMenuIsOpen((c) => !c);
        }}
        className="assignments__summary"
      >
        <AssignmentIcon className="assignments__icon" />
        <span className="assignments__label">Assignments</span>
      </summary>
      {menuIsOpen && (
        <div className="assignments__menu">
          <h2>Asignees</h2>
          {assignments.map((a) => (
            <div className="assignments__menu-item" key={a.id}>
              <span className="assignments__menu-item-label">{a.name}</span>
            </div>
          ))}
        </div>
      )}
    </details>
  );
};
