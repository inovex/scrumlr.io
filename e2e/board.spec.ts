import { test, expect } from "@playwright/test";
import { boardTest } from "@fixtures/board";
import { loginAnonymous, acceptCookies, joinBoard, updateUserSession, createTimer, createVoting } from "@helpers/api";

test.describe.configure({mode: "parallel"});

test.describe("testing board creation", () => {
  test.describe.configure({mode: "parallel"});
  const userName = "board playwright agent"

  test.beforeEach(async ({page}) => {
    await loginAnonymous(page, userName);
    await acceptCookies(page);

    await page.goto("/boards/templates");
    await page.on("dialog", (dialog) => dialog.accept());
  });

  test("should create board from lean coffe template", async ({page}) => {
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
    const password = "SuperStrongTestPassword";

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
});

test.describe("testing board interactions", () => {
  test.describe.configure({mode: "parallel"});

  boardTest("should mark as done", async ({page, board}) => {
    await page.goto(`/board/${board.boardId}`);

    const markAsDoneButton = page.getByRole("button", {name: "Mark me as done"});
    await expect(markAsDoneButton).toBeVisible();

    const ready = page.getByRole("button", {name: "Show profile settings"}).getByRole("img", {name: "Ready"});
    await expect(ready).not.toBeVisible();

    await markAsDoneButton.click();

    await expect(ready).toBeVisible();
  });

  boardTest("should remove mark as done", async ({page, board}) => {
    await joinBoard(page, board.boardId, {});
    await updateUserSession(page, board.boardId, board.userId, {ready: true});

    await page.goto(`/board/${board.boardId}`);

    const markAsDoneButton = page.getByRole("button", {name: "Mark me as done"});
    await expect(markAsDoneButton).toBeVisible();

    const ready = page.getByRole("button", {name: "Show profile settings"}).getByRole("img", {name: "Ready"});
    await expect(ready).toBeVisible();

    await markAsDoneButton.click();

    await expect(ready).not.toBeVisible();
  });

  boardTest("should raise hand", async ({page, board}) => {
    await page.goto(`/board/${board.boardId}`);

    const raiseHandButton = page.getByRole("button", {name: "Raise your hand"});
    await expect(raiseHandButton).toBeVisible();

    const raisedHand = page.getByRole("button", {name: "Show profile settings"}).getByRole("img", {name: "Raised hand"});
    await expect(raisedHand).not.toBeVisible();

    await raiseHandButton.click();

    await expect(raisedHand).toBeVisible();
  });

  boardTest("should remove raised hand", async ({page, board}) => {
    await joinBoard(page, board.boardId, {});
    await updateUserSession(page, board.boardId, board.userId, {raisedHand: true});

    await page.goto(`/board/${board.boardId}`);

    const raiseHandButton = page.getByRole("button", {name: "Lower your hand"});
    await expect(raiseHandButton).toBeVisible();

    const raisedHand = page.getByRole("button", {name: "Show profile settings"}).getByRole("img", {name: "Raised hand"});
    await expect(raisedHand).toBeVisible();

    await raiseHandButton.click();

    await expect(raisedHand).not.toBeVisible();
  });

  boardTest("should react on board", async ({page, board}) => {
    await page.goto(`/board/${board.boardId}`);

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

  boardTest("should create timer", async ({page, board}) => {
    await page.goto(`/board/${board.boardId}`);

    const timer = page.getByRole("button", {name: "Timer", exact: true});
    await expect(timer).not.toBeVisible();
    await timer.click();

    const oneMinuteButton = page.getByRole("button", {name: "minute 1"});
    await expect(oneMinuteButton).toBeVisible();
    await oneMinuteButton.click();

    await expect(timer).toBeVisible();
  });

  boardTest("should increment timer", async ({page, board}) => {
    await createTimer(page, board.boardId, {minutes: 1});

    await page.goto(`/board/${board.boardId}`);

    const timer = page.getByRole("timer");
    await expect(timer).toBeVisible();

    const incrementButton = page.getByRole("button", {name: "Increase timer by one minute"});
    await expect(incrementButton).toBeVisible();
    await incrementButton.click();

    await expect(timer).toContainText(/^0[12]:/);
  });

  boardTest("should stop timer", async ({page, board}) => {
    await createTimer(page, board.boardId, {minutes: 1});

    await page.goto(`/board/${board.boardId}`);

    const timer = page.getByRole("timer");
    await expect(timer).toBeVisible();

    await timer.hover();
    const endTimerButton = page.getByRole("button", {name: "End timer"});
    await endTimerButton.click();

    await expect(timer).not.toBeVisible();
  });

  boardTest("should create voting", async ({page, board}) => {
    await page.goto(`/board/${board.boardId}`);

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

  boardTest("should cancel voting", async ({page, board}) => {
    await createVoting(page, board.boardId, {
      allowMultipleVotes: true,
      isAnonymous: true,
      showVotesOfOthers: false,
      voteLimit: 5,
    });

    await page.goto(`/board/${board.boardId}`);

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

  boardTest("should conclude voting", async ({page, board}) => {
    await createVoting(page, board.boardId, {
      allowMultipleVotes: true,
      isAnonymous: true,
      showVotesOfOthers: false,
      voteLimit: 5,
    });

    await page.goto(`/board/${board.boardId}`);

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
});
