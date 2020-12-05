import {passNoteMiddleware} from "../note";
import {ActionFactory} from "../../action";
import { API } from "../../../api";

jest.mock('../../../api', () => {
    return {
        API: {
            addNote: jest.fn(),
            editNote: jest.fn(),
            deleteNote: jest.fn()
        }
    }
});

beforeEach(() => {
    (API.addNote as jest.Mock).mockClear();
    (API.editNote as jest.Mock).mockClear();
    (API.deleteNote as jest.Mock).mockClear();
});

const stateAPI = {
    getState: () => ({
        board: {
            data: {
                id: 'boardId'
            }
        }
    })
}

describe('note middleware', () => {
    test('add note', () => {
        passNoteMiddleware(stateAPI as any, jest.fn(), ActionFactory.addNote('columnId', 'Hello world'));
        expect(API.addNote).toHaveBeenCalledWith('boardId', 'columnId', 'Hello world');
    });

    test('edit note', () => {
        passNoteMiddleware(stateAPI as any, jest.fn(), ActionFactory.editNote('noteId', 'Changed text'));
        expect(API.editNote).toHaveBeenCalledWith('noteId', 'Changed text');
    });

    test('delete note', () => {
        passNoteMiddleware(stateAPI as any, jest.fn(), ActionFactory.deleteNote('noteId'));
        expect(API.deleteNote).toHaveBeenCalledWith('noteId');
    })
});

