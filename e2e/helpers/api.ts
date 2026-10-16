import { expect, Page } from "@playwright/test"
import { CreateBoardRequest, CreateTimerRequest, CreateVotingRequest, JoinRequest, UpdateUserSessionRequest } from "./requests";

const apiUrl = process.env.API_BASE_URL

export async function loginAnonymous(page: Page, name: string): Promise<string> {
  const response = await page.request.post(`${apiUrl}/login/anonymous`, {
    data: { "name": name }
  });

  await expect(response).toBeOK()
  const user = await response.json()
  await response.dispose()

  return user.id
}

export async function acceptCookies(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("scrumlr/cookie_consent", "true")
  });
}

export async function createBoard(page: Page, board: CreateBoardRequest): Promise<string> {
  const response = await page.request.post(`${apiUrl}/boards`, {
    data: JSON.stringify(board)
  })

  await expect(response).toBeOK()

  const boardResponse = await response.json()

  await response.dispose()
  return boardResponse.id
}

export async function joinBoard(page: Page, boardId: string, joinRequest: JoinRequest) {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/participants`, {
    data: JSON.stringify(joinRequest)
  })

  await expect(response).toBeOK();
  await response.dispose();
}

export async function updateUserSession(page: Page, boardId: string, userId: string, updateSession: UpdateUserSessionRequest) {
  const response = await page.request.put(`${apiUrl}/boards/${boardId}/participants/${userId}`, {
    data: JSON.stringify(updateSession)
  });

  await expect(response).toBeOK()
  await response.dispose()
}

export async function createTimer(page: Page, boardId: string, timer: CreateTimerRequest) {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/timer`, {
    data: JSON.stringify(timer)
  });

  await expect(response).toBeOK()
  await response.dispose()
}

export async function incrementTimer(page: Page, boardId: string) {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/timer/increment`);

  await expect(response).toBeOK()
  await response.dispose()
}

export async function deleteTimer(page: Page, boardId: string) {
  const response = await page.request.delete(`${apiUrl}/boards/${boardId}/timer`);

  await expect(response).toBeOK()
  await response.dispose()
}

export async function createVoting(page: Page, boardId: string, votingRequest: CreateVotingRequest): Promise<string> {
  const response = await page.request.post(`${apiUrl}/boards/${boardId}/votings`, {
    data: JSON.stringify(votingRequest)
  })

  await expect(response).toBeOK()
  const voting = await response.json()
  await response.dispose()

  return voting.id
}
