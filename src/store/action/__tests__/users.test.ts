import {UsersActionFactory, UsersActionType, UsersReduxAction} from "../users";
import {ReduxAction} from "../index";
import {UserClientModel} from "../../../types/user";
import {AssertTypeEqual} from "../../../testUtils";

describe('users actions', () => {
    test('equal number of action types and factory functions', () => {
        expect(Object.keys(UsersActionType).length).toEqual(Object.keys(UsersActionFactory).length);
    });

    describe('set users', () => {
        test('type is listed in users redux actions', () => {
            // testing type equality here will not report an error at runtime but cause problems with typescript
            const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.setUsers>, UsersReduxAction> = true;
            expect(assertion).toBe(true);
        });

        test('type is listed in general redux actions', () => {
            // testing type equality here will not report an error at runtime but cause problems with typescript
            const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.setUsers>, ReduxAction> = true;
            expect(assertion).toBe(true);
        });

        test('created action', () => {
            const user: UserClientModel = {
                id: 'id',
                displayName: 'John Doe',
                admin: true,
                updatedAt: new Date('2020-11-30'),
                createdAt: new Date('2020-11-30')
            };
            const action = UsersActionFactory.setUsers([ user ], true);

            expect(action).toEqual({
                type: '@@SCRUMLR/setUsers',
                users: [ user ],
                admin: true
            })
        });
    });

});
