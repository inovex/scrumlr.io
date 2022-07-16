import {saveAs} from "file-saver";
import {BoardDataType, BoardType, ColumnType, NoteType, ParticipantType, VotingType} from "components/SettingsDialog/ExportBoard/types";
import i18n from "i18next";
import {API} from "../api";

export const fileName = (name?: string) => {
  const date = new Date().toJSON().slice(0, 10);
  return `${date}_${name}`;
};

export const exportAsCSV = async (id: string, name?: string) => {
  const response = await API.exportBoard(id, "text/csv");
  const blob = await response.blob();
  saveAs(blob, `${fileName(name ?? "scrumlr.io")}.csv`);
};

export const exportAsJSON = async (id: string, name?: string) => {
  const response = await API.exportBoard(id, "application/json");
  const json = await response.json();
  const blob = new Blob([JSON.stringify(json)], {type: "application/json"});
  saveAs(blob, `${fileName(name ?? "scrumlr.io")}.json`);
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

const {t} = i18n;
const mdBoardHeader = (boardName: string) => `# ${boardName}\n`;

const mdBoardProperties = (board: BoardType, participants: ParticipantType[]) => {
  const header = `## ${i18n.t("MarkdownExport.properties")}\n`;
  const boardId = `- ${i18n.t("MarkdownExport.boardId")}: ${board.id}\n`;
  const participantsNumber = `- ${t("MarkdownExport.participants")}: ${participants.length}\n`;
  return `${header + boardId + participantsNumber}\n`;
};

const mdVotesPerNote = (noteId: string, votings: VotingType[]) => {
  const votes = votings ? getNoteVotes(noteId, votings) : 0;
  return votes ? `, ${votes} ${votes === 1 ? t("MarkdownExport.vote") : t("MarkdownExport.votes")}` : "";
};

const mdNote = (note: NoteType, participants: ParticipantType[], votes: string, stack: string) => {
  const nested = stack === "" && note.position.stack;
  return `${nested ? "\n    " : "\n"}- ${note.text} (${participants.filter((p) => p.user.id === note.author)[0].user.name}${votes})${stack}`;
};

const mdStack = (notesInStack: NoteType[], participants: ParticipantType[], votings: VotingType[]) =>
  notesInStack.length > 0 ? `${notesInStack.map((n) => mdNote(n, participants, mdVotesPerNote(n.id, votings), "")).join("")}` : "";

const mdNotesPerColumn = (columnId: string, notes: NoteType[], participants: ParticipantType[], votings: VotingType[]) =>
  notes
    .filter((n) => !n.position.stack && n.position.column === columnId)
    .sort((a, b) => compareNotes(a, b, votings))
    .map((n) => {
      const votes = mdVotesPerNote(n.id, votings);
      const stack = mdStack(getChildNotes(notes, votings, n.id), participants, votings);
      return mdNote(n, participants, votes, stack);
    })
    .join("");

const mdColumns = (columns: ColumnType[], notes: NoteType[], participants: ParticipantType[], votings: VotingType[]) => {
  const header = `## ${t("MarkdownExport.columns")}\n`;
  const columnList = columns
    .filter((c) => notes.filter((n) => n.position.column === c.id).length > 0)
    .map(
      (c: ColumnType) =>
        `### ${c.name} (${notes.filter((n) => n.position.column === c.id).length} ${t("MarkdownExport.notes")})\n${mdNotesPerColumn(c.id, notes, participants, votings)}`
    )
    .join("\n\n");
  return `${header + columnList}\n\n`;
};

const mdBranding = () =>
  `> ${i18n.t("PrintView.GeneratedOn")} [scrumlr.io](https://www.scrumlr.io)  \n${t("PrintView.ProvidedBy")} [inovex](https://www.inovex.de)  \n\n![Scrumlr Logo](${
    process.env.REACT_APP_PUBLIC_URL
  }/scrumlr-logo-light.svg)`;

const mdTemplate = (boardData: BoardDataType) =>
  mdBoardHeader(boardData.board.name) +
  mdColumns(boardData.columns, boardData.notes, boardData.participants, boardData.votings) +
  mdBoardProperties(boardData.board, boardData.participants) +
  mdBranding();

export const getMarkdownExport = async (id: string) => {
  const response = await API.exportBoard(id, "application/json");
  const json: BoardDataType = await response.json();
  return `${mdTemplate(json)}`;
};
