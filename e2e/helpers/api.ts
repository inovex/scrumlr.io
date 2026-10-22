import {expect, Page} from "@playwright/test";
import {
  CreateBoardRequest,
  CreateBoardTemplateRequest,
  CreateNoteRequest,
  CreateReactionRequest,
  CreateTimerRequest,
  CreateVotingRequest,
  JoinRequest,
  UpdateNoteRequest,
  UpdateUserSessionRequest,
} from "@helpers/requests";

const apiUrl = process.env.API_BASE_URL;

export async function loginAnonymous(page: Page, name: string): Promise<string> {
  const response = await page.request.post(`${apiUrl}/login/anonymous`, {
    data: {name: name},
  });

  await expect(response).toBeOK();

  const user = await response.json();

  await response.dispose();
  return user.id;
}

export async function acceptCookies(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("scrumlr/cookie_consent", "true");
  });
}

export async function createBoard(page: Page, board: CreateBoardRequest): Promise<string> {
  const response = await page.request.post(`${apiUrl}/boards`, {
    data: JSON.stringify(board),
  });

  await expect(response).toBeOK();

  const boardResponse = await response.json();

  await response.dispose();
  return boardResponse.id;
}

export async function joinBoard(page: Page, boardId: string, joinRequest: JoinRequest) {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/participants`, {
    data: JSON.stringify(joinRequest),
  });

  await expect(response).toBeOK();
  await response.dispose();
}

export async function updateUserSession(page: Page, boardId: string, userId: string, updateSession: UpdateUserSessionRequest) {
  const response = await page.request.put(`${apiUrl}/boards/${boardId}/participants/${userId}`, {
    data: JSON.stringify(updateSession),
  });

  await expect(response).toBeOK();
  await response.dispose();
}

export async function createTimer(page: Page, boardId: string, timer: CreateTimerRequest) {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/timer`, {
    data: JSON.stringify(timer),
  });

  await expect(response).toBeOK();
  await response.dispose();
}

export async function incrementTimer(page: Page, boardId: string) {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/timer/increment`);

  await expect(response).toBeOK();
  await response.dispose();
}

export async function deleteTimer(page: Page, boardId: string) {
  const response = await page.request.delete(`${apiUrl}/boards/${boardId}/timer`);

  await expect(response).toBeOK();
  await response.dispose();
}

export async function createVoting(page: Page, boardId: string, votingRequest: CreateVotingRequest): Promise<string> {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/votings`, {
    data: JSON.stringify(votingRequest),
  });

  await expect(response).toBeOK();

  const voting = await response.json();

  await response.dispose();
  return voting.id;
}

export async function createBoardTemplate(page: Page, boardTemplate: CreateBoardTemplateRequest): Promise<string> {
  const response = await page.request.post(`${apiUrl}/templates`, {
    data: JSON.stringify(boardTemplate),
  });

  await expect(response).toBeOK();

  const boardTemplateResponse = await response.json();

  await response.dispose();
  return boardTemplateResponse.id;
}

export async function createNote(page: Page, boardId: string, note: CreateNoteRequest): Promise<string> {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/notes`, {
    data: JSON.stringify(note),
  });

  await expect(response).toBeOK();

  const noteResponse = await response.json();

  await response.dispose();
  return noteResponse.id;
}

export async function getBoardColumns(page: Page, boardId: string): Promise<{id: string; name: string}[]> {
  const response = await page.request.get(`${apiUrl}/boards/${boardId}/columns`);

  await expect(response).toBeOK();

  const columns = await response.json();

  await response.dispose();
  return columns;
}

export async function updateNote(page: Page, boardId: string, noteId: string, updateRequest: UpdateNoteRequest): Promise<void> {
  const response = await page.request.put(`${apiUrl}/boards/${boardId}/notes/${noteId}`, {
    data: JSON.stringify(updateRequest),
  });

  await expect(response).toBeOK();
  await response.dispose();
}

export async function createNoteReaction(page: Page, boardId: string, reaction: CreateReactionRequest): Promise<string> {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/reactions`, {
    data: JSON.stringify(reaction),
  });

  await expect(response).toBeOK();

  const reactionResponse = await response.json();

  await response.dispose();
  return reactionResponse.id;
}
