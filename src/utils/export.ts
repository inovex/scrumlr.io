import {saveAs} from "file-saver";
import {BoardDataType, BoardType, ColumnType, NoteType, ParticipantType, VotingType} from "components/SettingsDialog/ExportBoard/types";
import i18n from "i18next";
import {DEFAULT_BOARD_NAME, DEFAULT_URL} from "constants/misc";
import {API} from "../api";

const {t} = i18n;

export const fileName = (name?: string) => {
  const date = new Date().toJSON().slice(0, 10);
  return `${date}_${name}`;
};

export const exportAsCSV = async (id: string, name?: string) => {
  const response = await API.exportBoard(id, "text/csv");
  const blob = await response.blob();
  saveAs(blob, `${fileName(name ?? DEFAULT_BOARD_NAME)}.csv`);
};

export const exportAsJSON = async (id: string, name?: string) => {
  const response = await API.exportBoard(id, "application/json");
  const json = await response.json();
  const blob = new Blob([JSON.stringify(json)], {type: "application/json"});
  saveAs(blob, `${fileName(name ?? DEFAULT_BOARD_NAME)}.json`);
};

export const getNoteVotes = (noteId: string, votings: VotingType[]) => votings[0].votes?.votesPerNote[noteId]?.total ?? 0;

export const compareNotes = (a: {id: string; position: {rank: number}}, b: {id: string; position: {rank: number}}, votings: VotingType[]) => {
  if (votings && getNoteVotes(a.id, votings) !== getNoteVotes(b.id, votings)) {
    return getNoteVotes(a.id, votings) > getNoteVotes(b.id, votings) ? -1 : 1;
  }
  return a.position.rank > b.position.rank ? -1 : 1;
};

export const getChildNotes = (notes: NoteType[], votings: VotingType[], noteId: string) =>
  notes.filter((n) => n.position.stack === noteId).sort((a, b) => compareNotes(a, b, votings));

export const getAuthorName = (authorId: string, participants: ParticipantType[]) => participants.filter((p: ParticipantType) => p.user?.id === authorId)[0].user?.name;

const mdItalicBrackets = (addBrackets: boolean, input: string) => (addBrackets ? `_(${input})_` : input);

const mdBoardHeader = (boardName: string) => `# ${boardName}\n\n`;

const mdBoardProperties = (board: BoardType, participants: ParticipantType[]) => {
  const linkToBoard = `- [${t("MarkdownExport.linkToBoard")}](${window.location.href.replace("/settings/export", "")})\n`;
  const participantsNumber = `- ${t("MarkdownExport.participants")}: ${participants.length}\n`;
  const authorsHidden = !board.showAuthors ? `- ${t("MarkdownExport.showAuthorsDisabled")}\n` : "";
  return `${participantsNumber + authorsHidden + linkToBoard}\n`;
};

const mdVotesPerNote = (noteId: string, votings: VotingType[]) => {
  const votes = votings ? getNoteVotes(noteId, votings) : 0;
  return votes ? `${votes} ${votes === 1 ? t("MarkdownExport.vote") : t("MarkdownExport.votes")}` : "";
};

const mdNote = (note: NoteType, author: string, votes: string, stack: string) => {
  const nested = stack === "" && note.position.stack;
  const bracketsRequired = !!author || !!votes;
  const separator = !!author && !!votes ? ", " : "";
  return `${nested ? "\n    " : "\n"}- ${note.text} ${mdItalicBrackets(bracketsRequired, `${author + separator + votes}`)}${stack}`;
};

const mdStack = (notesInStack: NoteType[], boardData: BoardDataType) =>
  notesInStack.length > 0
    ? `${notesInStack
        .map((n) =>
          mdNote(
            n,
            boardData.board.showAuthors ? getAuthorName(n.author, boardData.participants) : "",
            boardData.board.showAuthors ? mdVotesPerNote(n.id, boardData.votings) : "",
            ""
          )
        )
        .join("")}`
    : "";

const mdNotesPerColumn = (columnId: string, boardData: BoardDataType) =>
  boardData.notes
    .filter((n) => !n.position.stack && n.position.column === columnId)
    .sort((a, b) => compareNotes(a, b, boardData.votings))
    .map((n) => {
      const votes = boardData.board.showVoting ? mdVotesPerNote(n.id, boardData.votings) : "";
      const author = boardData.board.showAuthors ? getAuthorName(n.author, boardData.participants) : "";
      const stack = mdStack(getChildNotes(boardData.notes, boardData.votings, n.id), boardData);
      return mdNote(n, author, votes, stack);
    })
    .join("");

const mdColumns = (boardData: BoardDataType) => {
  const columnList = boardData.columns
    .filter((c) => boardData.notes.filter((n) => n.position.column === c.id).length > 0)
    .map((c: ColumnType) => `## ${c.name} (${boardData.notes.filter((n) => n.position.column === c.id).length} ${t("MarkdownExport.notes")})\n${mdNotesPerColumn(c.id, boardData)}`)
    .join("\n\n");
  return `${columnList}\n\n`;
};

const mdBranding = () =>
  `> ${t("PrintView.GeneratedOn")} [scrumlr.io](${DEFAULT_URL})   \n${t(
    "PrintView.ProvidedBy"
  )} [inovex](https://www.inovex.de)  \n\n![Scrumlr Logo](${DEFAULT_URL}/scrumlr-logo-light.svg)`;

const mdTemplate = (boardData: BoardDataType) =>
  mdBoardHeader(boardData.board.name || DEFAULT_BOARD_NAME) + mdBoardProperties(boardData.board, boardData.participants) + mdColumns(boardData) + mdBranding();

export const getMarkdownExport = async (id: string) => {
  const response = await API.exportBoard(id, "application/json");
  const json: BoardDataType = await response.json();
  return `${mdTemplate(json)}`;
};
