import test from "@playwright/test";
import { acceptCookies, createBoardTemplate, loginAnonymous } from "@helpers/api";

type TemplateFixture = {
  template: {
    templateId: string,
    templateName: string,
    userId: string,
  }
};

export const templateTest = test.extend<TemplateFixture>({
  template: async ({page}, use) => {
    const userName = "template playwright agent";
    const templateName = "template test"
    const userId = await loginAnonymous(page, userName);
    await acceptCookies(page);

    const templateId = await createBoardTemplate(page, {
      creator: userId,
      name: templateName,
      description: "",
      favourite: false,
      columnTemplates: [
        {name: "This", index: 0, visible: true, color: "backlog-blue"},
        {name: "That", index: 1, visible: true, color: "goal-green"},
      ],
    });

    await use({templateId, templateName, userId});
  },
});
