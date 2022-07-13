import {saveAs} from "file-saver";
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
