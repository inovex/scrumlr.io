import test from "@playwright/test";
import { acceptCookies, createBoard, createNote, getBoardColumns, loginAnonymous } from "@helpers/api";

type NoteFixture = {
  note: {
    boardId: string,
    columns: {id: string, name: string}[],
  }
};

export const noteTest = test.extend<NoteFixture>({
  note: async ({page}, use) => {
    const userName = "note playwright agent"
    await loginAnonymous(page, userName);
    await acceptCookies(page);

    const boardId = await createBoard(page, {
      name: "Board",
      accessPolicy: "PUBLIC",
      columns: [
        {name: "Start", color: "goal-green", index: 0, visible: true},
        {name: "Stop", color: "online-orange", index: 1, visible: true},
      ],
    });

    const columns = await getBoardColumns(page, boardId);

    await use({boardId, columns});
  },
});
