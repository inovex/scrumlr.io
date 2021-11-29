import {LoadingScreen} from "components/LoadingScreen";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import {Note} from "components/Note";
import {Request} from "components/Request";
import {useAppSelector} from "store";
import {Infobar} from "components/Infobar";
import {useTranslation} from "react-i18next";
import {TabIndex} from "constants/tabIndex";
import Parse from "parse";
import {ToastContainer} from "react-toastify";

export var Board = function () {
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
        <ToastContainer className="toast-container__container" toastClassName="toast-container__toast" bodyClassName="toast-container__body" limit={2} />
        {currentUserIsModerator && (
          <Request
            joinRequests={state.joinRequests.filter((joinRequest) => joinRequest.status === "pending")}
            users={state.users.all}
            raisedHands={state.users.usersRaisedHands.filter((id) => id !== Parse.User.current()?.id)}
            boardId={state.board.data!.id}
          />
        )}
        <Infobar
          endTime={state.board.data!.timerUTCEndTime}
          activeVoting={state.board.data?.voting === "active"}
          usedVotes={state.votes.filter((vote) => vote.user === Parse.User.current()?.id).length}
          possibleVotes={state.voteConfiguration.voteLimit}
        />
        <BoardComponent name={state.board.data!.name} boardstatus={boardstatus} currentUserIsModerator={currentUserIsModerator}>
          {state.board
            .data!.columns.filter((column) => !column.hidden || (currentUserIsModerator && state.userConfiguration?.showHiddenColumns))
            .map((column, columnIndex) => (
              <Column
                tabIndex={TabIndex.Column + columnIndex}
                key={column.columnId}
                id={column.columnId!}
                name={column.name}
                hidden={column.hidden}
                currentUserIsModerator={currentUserIsModerator}
                color={column.color}
              >
                {state.notes
                  .filter((note) => note.columnId === column.columnId)
                  .filter((note) => note.parentId == null)
                  .filter((note) => note.positionInStack == -1 || note.positionInStack == 0)
                  // It seems that Firefox and Chrome have different orders of notes in the array. Therefore, we need to distinguish between the undefined states.
                  .sort((a, b) => {
                    if (a.createdAt === undefined) return -1;
                    if (b.createdAt === undefined) return 1;
                    return b.createdAt!.getTime() - a.createdAt!.getTime();
                  })
                  .map((note, noteIndex) => (
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
                        .sort((a, b) => a.positionInStack - b.positionInStack)
                        .map((n) => ({...n, authorName: state.users.all.filter((user) => user.id === n.author)[0]?.displayName}))
                        .map((n) => ({...n, votes: state.votes.filter((vote) => vote.note === n.id)}))}
                      votes={state.votes.filter((vote) => vote.note === note.id)}
                      activeVoting={state.board.data?.voting === "active"}
                      activeModeration={{userId: state.board.data?.moderation.userId, status: state.board.data?.moderation.status === "active"}}
                      focus={note.focus}
                      tabIndex={TabIndex.Note + columnIndex * TabIndex.Note + noteIndex * 3}
                    />
                  ))}
              </Column>
            ))}
        </BoardComponent>
      </>
    );
  }
  return <LoadingScreen />;
};
