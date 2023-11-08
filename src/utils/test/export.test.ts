import {API} from "api";
import {BoardDataType} from "components/SettingsDialog/ExportBoard/types";
import {getMarkdownExport} from "../export";
import dummyBoardData from "./dummy-board-data.json";

describe("the board export functions", () => {
  it("returns the board data in markdown format", async () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    await import("i18nTest").then(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const boardData: BoardDataType = dummyBoardData;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete window.location;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.location = new URL(`https://scrumlr.io/board/${boardData.board.id}/settings/export`);

      API.exportBoard = jest.fn((): Promise<Response> => Promise.resolve(new Response(JSON.stringify(boardData))));

      const mdExport = await getMarkdownExport(boardData.board.id);

      expect(API.exportBoard).toHaveBeenCalledTimes(1);
      expect(mdExport).toBe(
        // eslint-disable-next-line max-len
        `# Test Board\n\n- Participants: 1\n- [Link to board](https://scrumlr.io/board/4af0854f-2cf1-4607-b1a6-6f96cd88a000)\n\n## Positive (2 Notes)\n\n- qwert _(Happy Hornet, 2 Votes)_\n    - asdf _(Happy Hornet, 1 Vote)_\n\n## Negative (2 Notes)\n\n- asdf _(Happy Hornet, 2 Votes)_\n- poiuz _(Happy Hornet)_\n\n> Generated on [scrumlr.io](https://scrumlr.io)  \nProvided with ♥️ by [inovex](https://www.inovex.de)  \n\n![Scrumlr Logo](https://scrumlr.io/scrumlr-logo-light.svg)`
      );
    });
  });
});
