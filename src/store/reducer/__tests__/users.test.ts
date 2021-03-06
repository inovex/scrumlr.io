import {UsersState} from "../../../types/store";
import {usersReducer} from "../users";
import {ActionFactory} from "../../action";
import {UserClientModel} from "../../../types/user";

const createUser = (id: string, name: string, admin: boolean): UserClientModel => ({
    id,
    displayName: name,
    admin,
    createdAt: new Date(),
    updatedAt: new Date()
})

describe('users reducer', () => {

    let initialState: UsersState;

    beforeEach(() => {
        initialState = {
            admins: [],
            basic: [],
            all: []
        }
    });

    test('add admins', () => {
        const admin = createUser('1', 'John Doe', true);
        const newState = usersReducer(initialState, ActionFactory.setUsers([ admin ], true));

        expect(newState.admins).toEqual([ admin ]);
        expect(newState.all).toEqual([ admin ]);
        expect(newState.basic).toEqual([]);
    });

    test('add basic', () => {
        const user = createUser('2', 'Jane Doe', false);
        const newState = usersReducer(initialState, ActionFactory.setUsers([ user ], false));

        expect(newState.basic).toEqual([ user ]);
        expect(newState.all).toEqual([ user ]);
        expect(newState.admins).toEqual([]);
    });

    test('merge admins and basic users', () => {
        const admin = createUser('1', 'John Doe', true);
        const user = createUser('2', 'Jane Doe', false);

        const state1 = usersReducer(initialState, ActionFactory.setUsers([ user ], false));
        const state2 = usersReducer(state1, ActionFactory.setUsers([ admin ], true));

        expect(state2.admins).toEqual([ admin ]);
        expect(state2.basic).toEqual([ user ]);
        expect(state2.all).toContain(admin);
        expect(state2.all).toContain(user);
    });
});