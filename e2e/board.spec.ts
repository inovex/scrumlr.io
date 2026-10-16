import {test, expect} from "@playwright/test";

import {loginAnonymous, acceptCookies, createBoard, joinBoard, updateUserSession, createTimer, createVoting} from "./helpers/api.ts";

test("should create board from lean coffe template", async ({page}) => {
  const name = "create board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const leanCoffeTemplate = recomendedSection.getByRole("group", {name: "Lean Coffee"});

  const createFromRecomended = leanCoffeTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const openAccess = accessSettings.getByRole("button", {name: "Open"});
  await openAccess.click();

  await expect(openAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "Lean Coffee"})).toBeVisible();
});

test("should create board from quick review template", async ({page}) => {
  const name = "create board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const quickReviewTemplate = recomendedSection.getByRole("group", {name: "Quick Review"});

  const createFromRecomended = quickReviewTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const openAccess = accessSettings.getByRole("button", {name: "Open"});
  await openAccess.click();

  await expect(openAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "Quick Review"})).toBeVisible();
});

test("should create board from status quo check template", async ({page}) => {
  const name = "create board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const statusQuoCheckTemplate = recomendedSection.getByRole("group", {name: "Status-quo-Check"});

  const createFromRecomended = statusQuoCheckTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const openAccess = accessSettings.getByRole("button", {name: "Open"});
  await openAccess.click();

  await expect(openAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "Status-quo-Check"})).toBeVisible();
});

test("should create board from mood template", async ({page}) => {
  const name = "create board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const moodTemplate = recomendedSection.getByRole("group", {name: "Mood"});

  const createFromRecomended = moodTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const openAccess = accessSettings.getByRole("button", {name: "Open"});
  await openAccess.click();

  await expect(openAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "Mood"})).toBeVisible();
});

test("should create board from kalm template", async ({page}) => {
  const name = "create board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const kalmTemplate = recomendedSection.getByRole("group", {name: "KALM"});

  const createFromRecomended = kalmTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const openAccess = accessSettings.getByRole("button", {name: "Open"});
  await openAccess.click();

  await expect(openAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "KALM"})).toBeVisible();
});

test("should create board from 4l template", async ({page}) => {
  const name = "create board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const fourLTemplate = recomendedSection.getByRole("group", {name: "4L"});

  const createFromRecomended = fourLTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const openAccess = accessSettings.getByRole("button", {name: "Open"});
  await openAccess.click();

  await expect(openAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "4L"})).toBeVisible();
});

test("should create board from swot template", async ({page}) => {
  const name = "create board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const swatTemplate = recomendedSection.getByRole("group", {name: "SWOT"});

  const createFromRecomended = swatTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const openAccess = accessSettings.getByRole("button", {name: "Open"});
  await openAccess.click();

  await expect(openAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "SWOT"})).toBeVisible();
});

test("should create board with approval", async ({page}) => {
  const name = "create board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const leanCoffeeTemplate = recomendedSection.getByRole("group", {name: "Lean Coffee"});

  const createFromRecomended = leanCoffeeTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const approvalAccess = accessSettings.getByRole("button", {name: "Approval"});
  await approvalAccess.click();

  await expect(approvalAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "Lean Coffee"})).toBeVisible();
  await expect(page.getByText("Closed", {exact: true})).toBeVisible();
});

test("should create board with password", async ({page}) => {
  const name = "create board playwright agent";
  const password = "SuperStrongTestPassword";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");
  await page.on("dialog", (dialog) => dialog.accept());

  const recomendedSection = page.getByRole("region", {name: "Our Recommendations"});

  const leanCoffeeTemplate = recomendedSection.getByRole("group", {name: "Lean Coffee"});

  const createFromRecomended = leanCoffeeTemplate.getByRole("button", {name: "Start"});
  await createFromRecomended.click();

  const accessSettings = page.getByRole("dialog", {name: "Access Settings"});

  const passwordAccess = accessSettings.getByRole("button", {name: "Password Protected"});
  await passwordAccess.click();

  await expect(passwordAccess.getByRole("radio")).toBeChecked();

  const start = accessSettings.getByRole("button", {name: "Start Session"});
  await expect(start).toBeDisabled();

  const passwordBox = page.getByRole("textbox", {name: "Enter password here"});
  await passwordBox.fill(password);

  await expect(start).toBeEnabled();
  await start.click();

  await expect(page).toHaveURL(new RegExp("/board/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
  await expect(page.getByRole("heading", {name: "Lean Coffee"})).toBeVisible();
  await expect(page.getByText("Password protected", {exact: true})).toBeVisible();
});

test("should mark as done", async ({page}) => {
  const name = "mark as done playwright agent";
  await loginAnonymous(page, name);
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

  await page.goto(`/board/${boardId}`);

  const markAsDoneButton = page.getByRole("button", {name: "Mark me as done"});
  await expect(markAsDoneButton).toBeVisible();

  const ready = page.getByRole("button", {name: "Show profile settings"}).getByRole("img", {name: "Ready"});
  await expect(ready).not.toBeVisible();

  await markAsDoneButton.click();

  await expect(ready).toBeVisible();
});

test("should remove mark as done", async ({page}) => {
  const name = "remove mark as done playwright agent";
  const userId = await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Remove mark as done",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await joinBoard(page, boardId, {});
  await updateUserSession(page, boardId, userId, {ready: true});

  await page.goto(`/board/${boardId}`);

  const markAsDoneButton = page.getByRole("button", {name: "Mark me as done"});
  await expect(markAsDoneButton).toBeVisible();

  const ready = page.getByRole("button", {name: "Show profile settings"}).getByRole("img", {name: "Ready"});
  await expect(ready).toBeVisible();

  await markAsDoneButton.click();

  await expect(ready).not.toBeVisible();
});

test("should raise hand", async ({page}) => {
  const name = "raise hand playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Raise hand",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await page.goto(`/board/${boardId}`);

  const raiseHandButton = page.getByRole("button", {name: "Raise your hand"});
  await expect(raiseHandButton).toBeVisible();

  const raisedHand = page.getByRole("button", {name: "Show profile settings"}).getByRole("img", {name: "Raised hand"});
  await expect(raisedHand).not.toBeVisible();

  await raiseHandButton.click();

  await expect(raisedHand).toBeVisible();
});

test("should remove raised hand", async ({page}) => {
  const name = "remove raised hand playwright agent";
  const userId = await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Remove raised hand",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await joinBoard(page, boardId, {});
  await updateUserSession(page, boardId, userId, {raisedHand: true});

  await page.goto(`/board/${boardId}`);

  const raiseHandButton = page.getByRole("button", {name: "Lower your hand"});
  await expect(raiseHandButton).toBeVisible();

  const raisedHand = page.getByRole("button", {name: "Show profile settings"}).getByRole("img", {name: "Raised hand"});
  await expect(raisedHand).toBeVisible();

  await raiseHandButton.click();

  await expect(raisedHand).not.toBeVisible();
});

test("should react on board", async ({page}) => {
  const name = "react on board playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "React on board",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await page.goto(`/board/${boardId}`);

  const boardReactionsButton = page.getByRole("button", {name: "React", exact: true});
  await expect(boardReactionsButton).toBeVisible();

  const boardReaction = page.locator(".board-reaction__root");
  await expect(boardReaction).not.toBeVisible();

  await boardReactionsButton.click();

  const reactionMenuItem = page.getByRole("button", {name: "React with tada"});
  await expect(reactionMenuItem).toBeVisible();
  await reactionMenuItem.click();

  await expect(boardReaction).toBeVisible();
});

test("should create timer", async ({page}) => {
  const name = "create timer playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Create timer",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await page.goto(`/board/${boardId}`);

  const timer = page.getByRole("button", {name: "Timer", exact: true});
  await expect(timer).not.toBeVisible();
  await timer.click();

  const oneMinuteButton = page.getByRole("button", {name: "minute 1"});
  await expect(oneMinuteButton).toBeVisible();
  await oneMinuteButton.click();

  await expect(timer).toBeVisible();
});

test("should increment timer", async ({page}) => {
  const name = "increment timer playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Increment timer",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await createTimer(page, boardId, {minutes: 1});

  await page.goto(`/board/${boardId}`);

  const timer = page.getByRole("timer");
  await expect(timer).toBeVisible();

  const incrementButton = page.getByRole("button", {name: "Increase timer by one minute"});
  await expect(incrementButton).toBeVisible();
  await incrementButton.click();

  await expect(timer).toContainText(/^0[12]:/);
});

test("should stop timer", async ({page}) => {
  const name = "stop timer playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Stop timer",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await createTimer(page, boardId, {minutes: 1});

  await page.goto(`/board/${boardId}`);

  const timer = page.getByRole("timer");
  await expect(timer).toBeVisible();

  await timer.hover();
  const endTimerButton = page.getByRole("button", {name: "End timer"});
  await endTimerButton.click();

  await expect(timer).not.toBeVisible();
});

test("should create voting", async ({page}) => {
  const name = "create voting playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Create voting",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await page.goto(`/board/${boardId}`);

  const voteDisplay = page.getByRole("status", {name: "voting"});
  await expect(voteDisplay).not.toBeVisible();

  const votingButton = page.getByRole("button", {name: "Voting", exact: true});
  await expect(votingButton).toBeVisible();
  await votingButton.click();

  const startVotingButton = page.getByRole("button", {name: "Start voting phase"});
  await expect(startVotingButton).toBeVisible();
  await startVotingButton.click();

  await expect(voteDisplay).toBeVisible();
});

test("should cancel voting", async ({page}) => {
  const name = "cancel voting playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Cancel voting",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await createVoting(page, boardId, {
    allowMultipleVotes: true,
    isAnonymous: true,
    showVotesOfOthers: false,
    voteLimit: 5,
  });

  await page.goto(`/board/${boardId}`);

  const voteDisplay = page.getByRole("status", {name: "voting"});
  await expect(voteDisplay).toBeVisible();

  const votingButton = page.getByRole("button", {name: "Voting", exact: true});
  await expect(votingButton).toBeVisible();
  await votingButton.click();

  const abortVotingButton = page.getByRole("button", {name: "Abort voting phase"});
  await expect(abortVotingButton).toBeVisible();
  await abortVotingButton.click();

  await expect(voteDisplay).not.toBeVisible();
});

test("should conclude voting", async ({page}) => {
  const name = "conclude voting playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Conclude voting",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
      {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
      {name: "Action", color: "poker-purple", index: 3, visible: false},
    ],
  });

  await createVoting(page, boardId, {
    allowMultipleVotes: true,
    isAnonymous: true,
    showVotesOfOthers: false,
    voteLimit: 5,
  });

  await page.goto(`/board/${boardId}`);

  const voteDisplay = page.getByRole("status", {name: "voting"});
  await expect(voteDisplay).toBeVisible();

  const votingButton = page.getByRole("button", {name: "Voting", exact: true});
  await expect(votingButton).toBeVisible();
  await votingButton.click();

  const stopVotingButton = page.getByRole("button", {name: "End voting phase"});
  await expect(stopVotingButton).toBeVisible();
  await stopVotingButton.click();

  await expect(voteDisplay).not.toBeVisible();
});
