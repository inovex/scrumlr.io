import test from "@playwright/test";
import { acceptCookies, loginAnonymous } from "@helpers/api";

type LogoutFixture = {
  logout: {
    userName: string
  }
};

export const logoutTest = test.extend<LogoutFixture>({
  logout: async ({page}, use, testInfo) => {
    await loginAnonymous(page, testInfo.title);
    await acceptCookies(page);

    await page.on("dialog", (dialog) => dialog.accept());

    await use({userName: testInfo.title})
  },
});
