import {ApplicationState} from "types/store";
import {Parser} from "json2csv";

export const exportAsCSV = (state: ApplicationState) => {
  const json2csvParser = new Parser({quote: ""});
  const csv = json2csvParser.parse(exportAsJSON(state));
  console.log(csv);
  return "test";
};

export const exportAsJSON = (state: ApplicationState) => JSON.stringify(state, null, 4);
