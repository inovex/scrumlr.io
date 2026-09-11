import type http from "k6/http";
import type { Note } from "../../types/note.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateNoteRequest, DeleteNoteRequest, UpdateNoteRequest } from "./requests.ts";

export class NoteClient extends BaseClient {
	createNote(boardId: string, noteReq: CreateNoteRequest, cookieJar?: http.CookieJar): [Note | null, http.Response] {
		const response = this.post(`./boards/${boardId}/notes`, noteReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const note: Note = response.json() as unknown as Note;
		return [note, response];
	}

	getNotes(boardId: string, cookieJar?: http.CookieJar): [Note[], http.Response] {
		const response = this.get(`./boards/${boardId}/notes`, [], cookieJar);
		if (response.error_code) {
			return [[], response];
		}

		const note: Note[] = response.json() as unknown as Note[];
		return [note, response];
	}

	getNote(boardId: string, noteId: string, cookieJar?: http.CookieJar): [Note | null, http.Response] {
		const response = this.get(`./boards/${boardId}/notes/${noteId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const note: Note = response.json() as unknown as Note;
		return [note, response];
	}

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

	deleteNote(boardId: string, noteId: string, deleteReq: DeleteNoteRequest, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}/notes/${noteId}`, deleteReq, [], cookieJar);
		return response;
	}
}
