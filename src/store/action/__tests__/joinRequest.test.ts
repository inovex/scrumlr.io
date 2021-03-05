import {JoinRequestActionFactory, JoinRequestActionType, JoinRequestReduxAction} from "../joinRequest";
import {AssertTypeEqual} from "testUtils";
import {ReduxAction} from "../index";
import {JoinRequestClientModel} from "types/joinRequest";

describe('joinRequest actions', () => {

    const id = 'joinRequestId';
    const boardId = 'boardId';
    const userId = 'userId';
    const joinRequest: JoinRequestClientModel = {
        id, boardId, userId,
        status: 'accepted'
    }

    test('equal number of action types and factory functions', () => {
        expect(Object.keys(JoinRequestActionType).length).toEqual(Object.keys(JoinRequestActionFactory).length);
    });

    describe('acceptJoinRequest', () => {
        test('type is listed in joinRequest redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.acceptJoinRequest>, JoinRequestReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('type is listed in general redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.acceptJoinRequest>, ReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('should dispatch correct action object', () => {
            const action = JoinRequestActionFactory.acceptJoinRequest(id, boardId, userId);
            expect(action).toEqual({
                type: JoinRequestActionType.AcceptJoinRequest,
                id, boardId, userId
            });
        });
    });

    describe('rejectJoinRequest', () => {
        test('type is listed in joinRequest redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.rejectJoinRequest>, JoinRequestReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('type is listed in general redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.rejectJoinRequest>, ReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('should dispatch correct action object', () => {
            const action = JoinRequestActionFactory.rejectJoinRequest(id, boardId, userId);
            expect(action).toEqual({
                type: JoinRequestActionType.RejectJoinRequest,
                id, boardId, userId
            });
        });
    });

    describe('initializeJoinRequests', () => {
        test('type is listed in joinRequest redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.initializeJoinRequests>, JoinRequestReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('type is listed in general redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.initializeJoinRequests>, ReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('should dispatch correct action object', () => {
            const action = JoinRequestActionFactory.initializeJoinRequests([joinRequest]);
            expect(action).toEqual({
                type: JoinRequestActionType.InitializeJoinRequests,
                joinRequests: [joinRequest]
            });
        });
    });

    describe('createJoinRequest', () => {
        test('type is listed in joinRequest redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.createJoinRequest>, JoinRequestReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('type is listed in general redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.createJoinRequest>, ReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('should dispatch correct action object', () => {
            const action = JoinRequestActionFactory.createJoinRequest(joinRequest);
            expect(action).toEqual({
                type: JoinRequestActionType.CreateJoinRequest,
                joinRequest
            });
        });
    });

    describe('updateJoinRequest', () => {
        test('type is listed in joinRequest redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.updateJoinRequest>, JoinRequestReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('type is listed in general redux actions', () => {
            const assertion: AssertTypeEqual<ReturnType<typeof JoinRequestActionFactory.updateJoinRequest>, ReduxAction> = true;
            expect(assertion).toBeTruthy();
        });

        test('should dispatch correct action object', () => {
            const action = JoinRequestActionFactory.updateJoinRequest(joinRequest);
            expect(action).toEqual({
                type: JoinRequestActionType.UpdateJoinRequest,
                joinRequest
            });
        });
    });
});