import {UsersState} from "types/store";
import {parse} from "json2csv";
import {NoteClientModel} from "types/note";
import {VoteClientModel} from "types/vote";
import {saveAs} from "file-saver";
import {ColumnClientModel} from "types/column";

export type ExportProps = {
  board: {
    columns: ColumnClientModel[];
    votingIteration: number;
    name: string;
  };
  notes: NoteClientModel[];
  votes: VoteClientModel[];
  users: UsersState;
};

export type ExportFormat = {
  noteId: string;
  author: string;
  text: string;
  column: string;
  timestamp: string;
  parent: string;
  votes: number;
};

export const mapToExport = (state: ExportProps) =>
  state.notes.map((note) => {
    const votes = state.votes.filter((vote) => vote.note === note.id);
    const result: ExportFormat = {
      noteId: note.id || "-",
      author: state.users.all.find((user) => user.id === note.author)?.displayName || note.author,
      text: note.text,
      column: state.board.columns.find((column) => column.columnId === note.columnId)?.name!,
      timestamp: note.createdAt?.toUTCString().replace(",", "") || "-",
      parent: note.parentId || "-",
      votes: votes.length,
    };
    const votingIterations = {};
    for (let i = 1; i <= state.board.votingIteration; ++i) {
      votingIterations[`voting_iteration_${i}`] = votes.filter((vote) => vote.votingIteration === i).length;
    }
    return {...result, ...votingIterations};
  });

export const generateCSV = (state: ExportProps) => {
  const fields = ["noteId", "author", "text", "column", "timestamp", "parent", "votes"];
  for (let i = 1; i <= state.board.votingIteration; ++i) {
    fields.push(`voting_iteration_${i}`);
  }
  const csv = parse(mapToExport(state), {quote: "", fields});
  return csv;
};

export const fileName = (state: ExportProps) => {
  const date = new Date().toJSON().slice(0, 10);
  return `${date}_${state.board.name}`;
};

export const exportAsCSV = (state: ExportProps) => {
  const blob = new Blob([generateCSV(state)], {type: "text/csv"});
  saveAs(blob, `${fileName(state)}.csv`);
};

export const exportAsJSON = (state: ExportProps) => {
  const content = JSON.stringify(mapToExport(state), null, 2);
  const blob = new Blob([content], {type: "application/json"});
  saveAs(blob, `${fileName(state)}.json`);
};
