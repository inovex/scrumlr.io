import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "../../types/store";
import {ActionFactory, ActionType, ReduxAction} from "../action";
import Parse from "parse";
import {mapUserServerToClientModel} from "../../types/user";
import {mapNoteServerToClientModel, NoteServerModel} from "../../types/note";
import {mapBoardServerToClientModel} from "../../types/board";

let closeSubscriptions: Function[] = [];

export const passBoardMiddleware = (stateAPI: MiddlewareAPI<any, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
    if (action.type === ActionType.LeaveBoard) {
        closeSubscriptions.forEach((closeCallback) => closeCallback());
        closeSubscriptions = [];
    }

    if (action.type === ActionType.PermittedBoardAccess) {
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
                    createUsersSubscription();
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
}