import {AnyAction} from 'redux';
import {UsersState} from "../../types/store";
import {UserClientModel} from "../../types/user";

export const usersReducer = (state: UsersState  = { admins: [], basic: [], all: [] }, action: AnyAction): UsersState => {
    switch (action.type) {
        case '@@SCRUMLR/setUsers': {
            const newState = {
                admins: state.admins,
                basic: state.basic,
                all: [] as UserClientModel[]
            }

            if (action.payload.admin) {
                newState.admins = action.payload.users;
            } else {
                newState.basic = action.payload.users;
            }

            newState.all = [ ...newState.admins ];
            newState.basic.forEach((member) => {
                if (!newState.admins.find((admin) => admin.id === member.id)) {
                    newState.all.push(member);
                }
            });

            return newState;
        }
    }
    return state;
}