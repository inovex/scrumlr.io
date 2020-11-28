import {createStore, applyMiddleware, combineReducers, Dispatch, MiddlewareAPI} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import Parse from 'parse';
import {mapBoardServerToClientModel} from "../types/board";
import {ApplicationState} from "../types/store";
import {NoteServerModel, mapNoteServerToClientModel} from "../types/note";
import {mapUserServerToClientModel} from "../types/user";
import {ActionType, ActionFactory, ReduxAction} from "./action";
import {boardReducer} from "./reducer/board";
import {noteReducer} from "./reducer/note";
import {usersReducer} from "./reducer/users";

let closeSubscriptions: Function[] = [];

const parseMiddleware = (stateAPI: MiddlewareAPI<any, ApplicationState>) => (dispatch: Dispatch) => (action: ReduxAction) => {
    if (action.type === ActionType.LeaveBoard) {
        closeSubscriptions.forEach((closeCallback) => closeCallback());
        closeSubscriptions = [];
    }

    if (action.type === ActionType.AddNote) {
        try {
            return dispatch(action);
        } finally {
            const boardId = stateAPI.getState().board.data!.id;
            // TODO retry mechanism
            Parse.Cloud.run('addNote', { board: boardId, text: action.text });
        }
    }

    if (action.type === ActionType.DeleteNote) {
        try {
            return dispatch(action);
        } finally {
            const boardId = stateAPI.getState().board.data!.id;
            // TODO retry mechanism
            Parse.Cloud.run('deleteNote', { board: boardId, note: action.noteId });
        }
    }

    if (action.type === ActionType.EditNote) {
        try {
            return dispatch(action);
        } finally {
            const boardId = stateAPI.getState().board.data!.id;
            // TODO retry mechanism
            Parse.Cloud.run('editNote', { board: boardId, note: action.noteId, text: action.text });
        }
    }

    if (action.type === ActionType.JoinBoard) {
        const createUsersSubscription = () => {
            const adminsQuery = new Parse.Query(Parse.Role);
            adminsQuery.equalTo('name', `admin_of_${action.boardId}`);
            const memberQuery = new Parse.Query(Parse.Role);
            memberQuery.equalTo('name', `member_of_${action.boardId}`);

            const usersQuery = Parse.Query.or(adminsQuery, memberQuery);
            usersQuery.subscribe().then((subscription) => {
                closeSubscriptions.push(() => { subscription.unsubscribe() });

                const updateUsers = (role: Parse.Role) => {
                    if (role.getName() === `member_of_${action.boardId}`) {
                        role.getUsers().query().find().then((users) => {
                            dispatch(ActionFactory.setUsers(
                                users.map((user) => mapUserServerToClientModel(user.toJSON() as any, false)),
                                false
                            ));
                        });
                    }
                    if (role.getName() === `admin_of_${action.boardId}`) {
                        role.getUsers().query().find().then((users) => {
                            dispatch(ActionFactory.setUsers(
                                users.map((user) => mapUserServerToClientModel(user.toJSON() as any, true)),
                                true
                            ));
                        });
                    }
                }

                subscription.on('update', (object) => {
                    updateUsers(object as Parse.Role);
                });
                subscription.on('open', () => {
                    usersQuery.find().then((results) => {
                        for (const result of results) {
                            updateUsers(result as Parse.Role);
                        }
                    });
                });
            });
        }

        const createNoteSubscription = () => {
            const noteQuery = new Parse.Query('Note');
            noteQuery.equalTo('board', Parse.Object.extend('Board').createWithoutData(action.boardId));
            noteQuery.subscribe().then((subscription) => {
                closeSubscriptions.push(() => { subscription.unsubscribe() });
                subscription.on('create', (object) => {
                    dispatch(ActionFactory.createdNote(mapNoteServerToClientModel(object as NoteServerModel)))
                });
                subscription.on('update', (object) => {
                    dispatch(ActionFactory.updatedNote(mapNoteServerToClientModel(object as NoteServerModel)));
                });
                subscription.on('delete', (object) => {
                    dispatch(ActionFactory.deleteNote(object.id));
                });
                subscription.on('open', () => {
                    createUsersSubscription();
                    noteQuery.find().then((results) => {
                        dispatch(ActionFactory.initializeNotes((results as any[]).map(mapNoteServerToClientModel)));
                    });
                });
            });
        }

        const createBoardSubscription = () => {
            const boardQuery = new Parse.Query('Board');
            boardQuery.equalTo('objectId', action.boardId);
            boardQuery.subscribe().then((subscription) => {
                closeSubscriptions.push(() => { subscription.unsubscribe() });
                subscription.on('update', (object) => {
                    dispatch(ActionFactory.updateBoard(mapBoardServerToClientModel(object.toJSON() as any)));
                });
                subscription.on('delete', (object) => {
                    dispatch(ActionFactory.deleteBoard());
                });
                subscription.on('open', () => {
                    createNoteSubscription();
                    boardQuery.first().then((board) => {
                        dispatch(ActionFactory.initializeBoard(mapBoardServerToClientModel(board?.toJSON() as any)));
                    });
                });
            });
        }

        createBoardSubscription();
        /*const votesQuery = new Parse.Query(' Vote');
        votesQuery.equalTo('board', Parse.Object.extend('Board').createWithoutData(action.board));
        votesQuery.subscribe().then((subscription) => {

        });*/
    }

    return dispatch(action);
}

const rootReducer = combineReducers<ApplicationState>({
    board: boardReducer,
    notes: noteReducer,
    users: usersReducer
});

const store = createStore(rootReducer, composeWithDevTools(
    applyMiddleware(thunk),
    applyMiddleware(parseMiddleware)
));

export default store;