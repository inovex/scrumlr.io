import test from "@playwright/test";
import { acceptCookies, createBoard, loginAnonymous } from "@helpers/api";

type ColumnFixture = {
  column: {
    userId: string,
    boardId: string,
  }
};

export const columnTest = test.extend<ColumnFixture>({
  column: async ({page}, use, testInfo) => {
    const userId = await loginAnonymous(page, testInfo.title);
    await acceptCookies(page);

    const boardId = await createBoard(page, {
        name: "Board",
        accessPolicy: "PUBLIC",
        columns: [
          {name: "Start", color: "goal-green", index: 0, visible: true},
          {name: "Stop", description: "Initial description", color: "online-orange", index: 1, visible: true},
          {name: "Continue", color: "value-violet", index: 2, visible: false},
        ],
      });

      await use({userId, boardId})
  },
});
