import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import BoardComponent from "components/Board/Board";
import Column from "components/Column/Column";
import Parse from "parse";
import Note from "components/Note/Note";
import JoinRequest from "components/JoinRequest/JoinRequest";
import {useAppSelector} from "store";

function Board() {
  const state = useAppSelector((applicationState) => ({
    board: applicationState.board,
    notes: applicationState.notes,
    joinRequests: applicationState.joinRequests,
    users: applicationState.users,
  }));

  const currentUserIsModerator = state.users.admins.find((user) => user.id === Parse.User.current()!.id) !== undefined;

  let joinRequestComponent;
  if (currentUserIsModerator) {
    const pendingJoinRequests = state.joinRequests.filter((joinRequest) => joinRequest.status === "pending");
    if (pendingJoinRequests && pendingJoinRequests.length > 0) {
      joinRequestComponent = <JoinRequest joinRequests={pendingJoinRequests} />;
    }
  }
  let boardstatus = "Public Session";
  const joinConfirmationRequired = state.board.data?.joinConfirmationRequired;
  const accessCode = state.board.data?.accessCode;
  if (joinConfirmationRequired === true || (accessCode !== undefined && accessCode !== "")) {
    boardstatus = "Private Session";
  }

  if (state.board.status === "pending") {
    return <LoadingScreen />;
  }
  if (state.board.status === "ready") {
    return (
      <>
        {joinRequestComponent}
        <BoardComponent name={state.board.data!.name} boardstatus={boardstatus} currentUserIsModerator={currentUserIsModerator}>
          {state.board.data!.columns.map((column) => (
            <Column key={column.id} id={column.id!} name={column.name} color={column.color}>
              {state.notes
                .filter((note) => note.columnId === column.id)
                .filter((note) => note.parentId == null)
                .map((note) => (
                  <Note
                    showAuthors={state.board.data!.showAuthors}
                    isAdmin={currentUserIsModerator}
                    key={note.id}
                    noteId={note.id}
                    text={note.text}
                    authorId={note.author}
                    columnId={column.id!}
                    columnName={column.name}
                    columnColor={column.color}
                    childrenNotes={state.notes.filter((n) => note.id && note.id === n.parentId)}
                  />
                ))}
            </Column>
          ))}
        </BoardComponent>
      </>
    );
  }
  return <LoadingScreen />;
}
export default Board;
