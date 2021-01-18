import {API} from 'api';
import {passJoinRequestMiddleware} from "../joinRequest";
import {ActionFactory} from "../../action";

jest.mock('api', () => {
    return {
        API: {
            acceptJoinRequest: jest.fn(),
            rejectJoinRequest: jest.fn()
        }
    }
});

beforeEach(() => {
    (API.acceptJoinRequest as jest.Mock).mockClear();
    (API.rejectJoinRequest as jest.Mock).mockClear();
});

describe('joinRequest middleware', () => {
    test('acceptJoinRequest', () => {
        passJoinRequestMiddleware(undefined as any, jest.fn(), ActionFactory.acceptJoinRequest('id', 'boardId', 'userId'));
        expect(API.acceptJoinRequest).toHaveBeenCalledWith('boardId', 'userId');
    });

    test('rejectJoinRequest', () => {
        passJoinRequestMiddleware(undefined as any, jest.fn(), ActionFactory.rejectJoinRequest('id', 'boardId', 'userId'));
        expect(API.rejectJoinRequest).toHaveBeenCalledWith('boardId', 'userId');
    });
});