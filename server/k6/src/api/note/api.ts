import type http from "k6/http";
import type { Note } from "../../types/note.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateNoteRequest, DeleteNoteRequest, UpdateNoteRequest } from "./requests.ts";

export class NoteClient extends BaseClient {
	/**
	 * Create a new node on a board
	 *
	 * This calls `POST /boards/{id}/notes`
	 * @param boardId id of the board
	 * @param noteReq note to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the created note and the response
	 */
	createNote(boardId: string, noteReq: CreateNoteRequest, cookieJar?: http.CookieJar): [Note | null, http.Response] {
		const response = this.post(`./boards/${boardId}/notes`, noteReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const note: Note = response.json() as unknown as Note;
		return [note, response];
	}

	/**
	 * Get all notes on a board
	 *
	 * This calls `GET /boards/{id}/notes`
	 * @param boardId id of the board
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the notes and the response
	 */
	getNotes(boardId: string, cookieJar?: http.CookieJar): [Note[], http.Response] {
		const response = this.get(`./boards/${boardId}/notes`, [], cookieJar);
		if (response.error_code) {
			return [[], response];
		}

		const note: Note[] = response.json() as unknown as Note[];
		return [note, response];
	}

	/**
	 * Get a note on a board
	 *
	 * This calls `GET /boards/{id}/notes/{id}`
	 * @param boardId id of the board
	 * @param noteId id of the note
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the note and the response
	 */
	getNote(boardId: string, noteId: string, cookieJar?: http.CookieJar): [Note | null, http.Response] {
		const response = this.get(`./boards/${boardId}/notes/${noteId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const note: Note = response.json() as unknown as Note;
		return [note, response];
	}

	/**
	 * Update a note on a board
	 *
	 * This calls `PUT /boards/{id}/notes/{id}`
	 * @param boardId id of the board
	 * @param noteId id of the note
	 * @param updateReq update values
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated note and the response
	 */
	updateNote(
		boardId: string,
		noteId: string,
		updateReq: UpdateNoteRequest,
		cookieJar?: http.CookieJar,
	): [Note | null, http.Response] {
		const response = this.put(`./boards/${boardId}/notes/${noteId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const note: Note = response.json() as unknown as Note;
		return [note, response];
	}

	/**
	 * Deletes a note from a board
	 *
	 * This calls `DELETE /boards/{id}/notes/{id}`
	 * @param boardId id of the board
	 * @param noteId
	 * @param deleteReq
	 * @param cookieJar cookie jar with the authentication token
	 * @returns
	 */
	deleteNote(boardId: string, noteId: string, deleteReq: DeleteNoteRequest, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}/notes/${noteId}`, deleteReq, [], cookieJar);
		return response;
	}
}
