import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import {NoteInput} from "components/NoteInput";
import {useRef} from "react";
import {useDrop} from "react-dnd";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as visibleIcon} from "assets/icon-visible.svg";
import {ReactComponent as hiddenIcon} from "assets/icon-hidden.svg";
import {TabIndex} from "constants/tabIndex";
import Parse from "parse";
import _ from "underscore";
import {Note} from "../Note";

const MAX_NOTE_LENGTH = 1024;

export interface ColumnProps {
  id: string;
  name: string;
  color: Color;
  hidden: boolean;
  currentUserIsModerator: boolean;
  tabIndex?: number;
}

export const Column = ({id, name, color, hidden, currentUserIsModerator, tabIndex}: ColumnProps) => {
  const state = useAppSelector(
    (applicationState) => ({
      notes: applicationState.notes.filter(
        (note) => (applicationState.board.data?.showNotesOfOtherUsers || Parse.User.current()?.id === note.author) && note.columnId === id && note.parentId == null
      ),
      votes: applicationState.votes.filter(
        (vote) =>
          vote.votingIteration === applicationState.board.data?.votingIteration &&
          (applicationState.board.data?.voting === "disabled" || applicationState.voteConfiguration.showVotesOfOtherUsers || vote.user === Parse.User.current()?.id)
      ),
      completedVotes: applicationState.votes.filter((vote) => {
        if (applicationState.board.data?.voting === "disabled") {
          // map on vote results of the last voting iteration
          return vote.votingIteration === applicationState.board.data?.votingIteration;
        }
        // map on vote results of the previous, completed voting iteration
        // FIXME we'll have to keep track of cancelled voting iterations here since they'll be included in the results
        return vote.votingIteration === (applicationState.board.data?.votingIteration || 0) - 1;
      }),
      users: applicationState.users,
      board: {
        showAuthors: applicationState.board.data?.showAuthors,
        voting: applicationState.board.data?.voting,
        moderation: applicationState.board.data?.moderation,
      },
    }),
    _.isEqual
  );

  const columnRef = useRef<HTMLDivElement>(null);
  const [{isOver, canDrop}, drop] = useDrop(() => ({
    accept: ["NOTE", "STACK"],
    drop: (item: {id: string; columnId: string}, monitor) => {
      if (item.columnId !== id && !monitor.didDrop()) {
        store.dispatch(ActionFactory.dragNote({id: item.id, columnId: id}));
      }
    },
    collect: (monitor) => ({isOver: monitor.isOver(), canDrop: monitor.canDrop()}),
    canDrop: (item: {id: string; columnId: string}) => item.columnId !== id,
  }));

  if (columnRef.current && isOver) {
    const rect = columnRef.current.getBoundingClientRect();
    if (rect.left <= 0 || rect.right >= document.documentElement.clientWidth) {
      columnRef.current.scrollIntoView({inline: "start", behavior: "smooth"});
    }
  }

  const Icon = hidden ? hiddenIcon : visibleIcon;

  return (
    <section className={`column ${getColorClassName(color)}`} ref={columnRef}>
      <div className="column__content">
        <div className="column__header">
          <div className="column__header-title">
            <h2 className="column__header-text">{name}</h2>
            <span className="column__header-card-number">{state.notes.length}</span>
            {currentUserIsModerator && (
              <div className="column__header-toggle">
                <button
                  tabIndex={TabIndex.disabled}
                  className="column__header-toggle-button"
                  onClick={() => store.dispatch(ActionFactory.editColumn({columnId: id, hidden: !hidden}))}
                >
                  <Icon className="column__header-toggle-button-icon" />
                </button>
              </div>
            )}
          </div>
          <NoteInput columnId={id} tabIndex={tabIndex} maxNoteLength={MAX_NOTE_LENGTH} />
        </div>
        <div tabIndex={TabIndex.disabled} className={classNames("column__notes-wrapper", {"column__notes-wrapper--isOver": isOver && canDrop})} ref={drop}>
          <ul className="column__note-list">
            {state.notes
              .filter((note) => note.positionInStack === -1 || note.positionInStack === 0)
              .map((note) => ({...note, votes: state.completedVotes.filter((vote) => vote.note === note.id).length}))
              // It seems that Firefox and Chrome have different orders of notes in the array. Therefore, we need to distinguish between the undefined states.
              .sort((a, b) => {
                if (a.createdAt === undefined) return -1;
                if (b.createdAt === undefined) return 1;
                const voteDiff = b.votes - a.votes;
                if (voteDiff === 0) {
                  return b.createdAt!.getTime() - a.createdAt!.getTime();
                }
                return voteDiff;
              })
              .map((note, noteIndex) => (
                <Note
                  showAuthors={state.board.showAuthors!}
                  currentUserIsModerator={currentUserIsModerator}
                  key={note.id}
                  noteId={note.id}
                  text={note.text}
                  authorId={note.author}
                  authorName={state.users.all.filter((user) => user.id === note.author)[0]?.displayName}
                  columnId={id}
                  columnName={name}
                  columnColor={color}
                  childrenNotes={state.notes
                    .filter((n) => note.id && note.id === n.parentId)
                    .sort((a, b) => a.positionInStack - b.positionInStack)
                    .map((n) => ({...n, authorName: state.users.all.filter((user) => user.id === n.author)[0]?.displayName}))
                    .map((n) => ({...n, votes: state.votes.filter((vote) => vote.note === n.id)}))}
                  votes={state.votes.filter((vote) => vote.note === note.id)}
                  allVotesOfUser={state.votes.filter((vote) => vote.user === Parse.User.current()?.id)}
                  activeVoting={state.board.voting! === "active"}
                  activeModeration={{userId: state.board.moderation!.userId, status: state.board.moderation!.status === "active"}}
                  focus={note.focus}
                  tabIndex={TabIndex.Note + (tabIndex! - TabIndex.Column) * TabIndex.Note + noteIndex * 3}
                />
              ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
