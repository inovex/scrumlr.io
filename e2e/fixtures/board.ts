import test from "@playwright/test";
import { acceptCookies, createBoard, loginAnonymous } from "@helpers/api";

type BoardFixture = {
  board: {
    boardId: string,
    userId: string,
  }
};

export const boardTest = test.extend<BoardFixture>({
  board: async ({page}, use) => {
    const userName = "board playwright agent"
    const userId = await loginAnonymous(page, userName);
    await acceptCookies(page);

    const boardId = await createBoard(page, {
      name: "Mark as done",
      accessPolicy: "PUBLIC",
      columns: [
        {name: "Start", color: "goal-green", index: 0, visible: true},
        {name: "Stop", color: "online-orange", index: 1, visible: true},
        {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
        {name: "Action", color: "poker-purple", index: 3, visible: false},
      ],
    });

    await use({boardId, userId});
  },
});
