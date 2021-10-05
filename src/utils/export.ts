import {UsersState} from "types/store";
import {parse} from "json2csv";
import {NoteClientModel} from "types/note";
import {VoteClientModel} from "types/vote";
import {BoardClientModel} from "types/board";
import JSZip from "jszip";
import {saveAs} from "file-saver";

export type ExportProps = {
  board: BoardClientModel;
  notes: NoteClientModel[];
  votes: VoteClientModel[];
  users: UsersState;
};

export const generateCSV = (state: ExportProps) => {
  const columns = parse(state.board.columns, {quote: "", fields: ["id", "name", "color", "hidden"]});
  const board = parse(state.board, {
    quote: "",
    fields: ["id", "name", "joinConfirmationRequired", "encryptedContent", "showAuthors", "voting", "votingIteration", "showNotesOfOtherUsers", "createdAt", "updatedAt", "owner"],
  });
  const notes = parse(state.notes, {quote: "", fields: ["id", "columnId", "text", "author", "parentId", "createdAt", "updatedAt"]});
  const votes = parse(state.votes, {quote: "", fields: ["id", "board", "note", "user", "votingIteration"]});
  const users = parse(state.users.all, {quote: "", fields: ["id", "displayName", "admin", "createdAt", "updatedAt", "online"]});
  return [columns, board, notes, votes, users];
};

export const fileName = (state: ExportProps) => {
  const date = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
  return `${date}_${state.board.name}`;
};

export const exportAsCSV = (state: ExportProps) => {
  const csvs = generateCSV(state);
  let csv = "";
  csvs.forEach((entry) => {
    csv += entry;
    csv += "\n\n";
  });
  const blob = new Blob([csv], {type: "text/csv"});
  saveAs(blob, `${fileName(state)}.csv`);
};

export const exportAsCSVZip = (state: ExportProps) => {
  const [columns, board, notes, votes, users] = generateCSV(state);
  const zip = new JSZip();
  zip.file("columns.csv", columns);
  zip.file("board.csv", board);
  zip.file("notes.csv", notes);
  zip.file("votes.csv", votes);
  zip.file("users.csv", users);
  zip.generateAsync({type: "blob"}).then((content) => {
    saveAs(content, `${fileName(state)}.zip`);
  });
};

export const exportAsJSON = (state: ExportProps) => {
  const content = JSON.stringify(state);
  const blob = new Blob([content], {type: "application/json"});
  saveAs(blob, `${fileName(state)}.json`);
};
