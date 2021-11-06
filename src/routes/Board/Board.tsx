import {LoadingScreen} from "components/LoadingScreen";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import Parse from "parse";
import {Note} from "components/Note";
import {JoinRequest} from "components/JoinRequest";
import {useAppSelector} from "store";
import {Timer} from "components/Timer";
import {useTranslation} from "react-i18next";

export function Board() {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState) => ({
    board: applicationState.board,
    notes: applicationState.notes.filter((note) => applicationState.board.data?.showNotesOfOtherUsers || Parse.User.current()?.id === note.author),
    joinRequests: applicationState.joinRequests,
    users: applicationState.users,
    votes: applicationState.votes.filter(
      (vote) =>
        vote.votingIteration === applicationState.board.data?.votingIteration &&
        (applicationState.board.data?.voting === "disabled" || applicationState.voteConfiguration.showVotesOfOtherUsers || vote.user === Parse.User.current()?.id)
    ),
    voteConfiguration: applicationState.voteConfiguration,
    userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
  }));

  const currentUserIsModerator = state.users.admins.find((user) => user.id === Parse.User.current()!.id) !== undefined;

  let joinRequestComponent;
  if (currentUserIsModerator) {
    const pendingJoinRequests = state.joinRequests.filter((joinRequest) => joinRequest.status === "pending");
    if (pendingJoinRequests && pendingJoinRequests.length > 0) {
      joinRequestComponent = <JoinRequest joinRequests={pendingJoinRequests} />;
    }
  }
  let boardstatus = t("Board.publicSession");
  const accessPolicy = state.board.data?.accessPolicy;
  if (accessPolicy !== "Public") {
    boardstatus = t("Board.privateSession");
  }

  if (state.board.status === "pending") {
    return <LoadingScreen />;
  }

  if (state.board.status === "ready") {
    return (
      <>
        {joinRequestComponent}
        {state.board.data?.timerUTCEndTime && <Timer endTime={state.board.data.timerUTCEndTime} />}
        <BoardComponent name={state.board.data!.name} boardstatus={boardstatus} currentUserIsModerator={currentUserIsModerator}>
          {state.board
            .data!.columns.filter((column) => !column.hidden || (currentUserIsModerator && state.userConfiguration?.showHiddenColumns))
            .map((column) => (
              <Column key={column.columnId} id={column.columnId!} name={column.name} hidden={column.hidden} currentUserIsModerator={currentUserIsModerator} color={column.color}>
                {state.notes
                  .filter((note) => note.columnId === column.columnId)
                  .filter((note) => note.parentId == null)
                  .map((note) => (
                    <Note
                      showAuthors={state.board.data!.showAuthors}
                      currentUserIsModerator={currentUserIsModerator}
                      key={note.id}
                      noteId={note.id}
                      text={note.text}
                      authorId={note.author}
                      authorName={state.users.all.filter((user) => user.id === note.author)[0]?.displayName}
                      columnId={column.columnId!}
                      columnName={column.name}
                      columnColor={column.color}
                      childrenNotes={state.notes
                        .filter((n) => note.id && note.id === n.parentId)
                        .map((n) => ({...n, authorName: state.users.all.filter((user) => user.id === n.author)[0]?.displayName}))
                        .map((n) => ({...n, votes: state.votes.filter((vote) => vote.note === n.id)}))}
                      votes={state.votes.filter((vote) => vote.note === note.id)}
                      activeVoting={state.board.data?.voting === "active"}
                      activeModeration={{userId: state.board.data?.moderation.userId, status: state.board.data?.moderation.status === "active"}}
                      focus={note.focus}
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
