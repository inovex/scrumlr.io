import test from "@playwright/test";
import { acceptCookies, loginAnonymous } from "@helpers/api";

type LogoutFixture = {
  logout: {
    userName: string
  }
};

export const logoutTest = test.extend<LogoutFixture>({
  logout: async ({page}, use) => {
    const userName = "logout playwright agent"
    await loginAnonymous(page, userName);
    await acceptCookies(page);

    await page.on("dialog", (dialog) => dialog.accept());

    await use({userName})
  },
});
