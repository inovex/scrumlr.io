import {createStore, applyMiddleware, combineReducers, Dispatch, MiddlewareAPI} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import Parse from 'parse';
import {mapBoardServerToClientModel} from "../types/board";
import {ApplicationState} from "../types/store";
import {CardClientModel, CardServerModel, mapCardServerToClientModel} from "../types/card";
import {mapUserServerToClientModel, UserClientModel} from "../types/user";
import {ActionType, ActionFactory, ReduxAction} from "./action";


let closeSubscriptions: Function[] = [];

const parseMiddleware = (stateAPI: MiddlewareAPI<any, ApplicationState>) => (dispatch: Dispatch) => (action: ReduxAction) => {
    if (action.type === ActionType.LeaveBoard) {
        closeSubscriptions.forEach((closeCallback) => closeCallback());
        closeSubscriptions = [];
    }

    if (action.type === ActionType.AddCard) {
        try {
            return dispatch(action);
        } finally {
            const boardId = stateAPI.getState().board.data!.id;
            // TODO retry mechanism
            Parse.Cloud.run('addCard', { board: boardId, text: action.text });
        }
    }

    if (action.type === ActionType.DeleteCard) {
        try {
            return dispatch(action);
        } finally {
            const boardId = stateAPI.getState().board.data!.id;
            // TODO retry mechanism
            Parse.Cloud.run('deleteCard', { board: boardId, card: action.cardId });
        }
    }

    if (action.type === ActionType.EditCard) {
        try {
            return dispatch(action);
        } finally {
            const boardId = stateAPI.getState().board.data!.id;
            // TODO retry mechanism
            Parse.Cloud.run('editCard', { board: boardId, card: action.cardId, text: action.text });
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
                            dispatch({
                                type: '@@SCRUMLR/setUsers',
                                payload: {
                                    users: users.map((user) => mapUserServerToClientModel(user.toJSON() as any, false)),
                                    admin: false
                                }
                            });
                        });
                    }
                    if (role.getName() === `admin_of_${action.boardId}`) {
                        role.getUsers().query().find().then((users) => {
                            dispatch({
                                type: '@@SCRUMLR/setUsers',
                                payload: {
                                    users: users.map((user) => mapUserServerToClientModel(user.toJSON() as any, true)),
                                    admin: true
                                }
                            });
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

        const createCardsSubscription = () => {
            const cardQuery = new Parse.Query('Card');
            cardQuery.equalTo('board', Parse.Object.extend('Board').createWithoutData(action.boardId));
            cardQuery.subscribe().then((subscription) => {
                closeSubscriptions.push(() => { subscription.unsubscribe() });
                subscription.on('create', (object) => {
                    dispatch(ActionFactory.createdCard(mapCardServerToClientModel(object as CardServerModel)))
                });
                subscription.on('update', (object) => {
                    dispatch(ActionFactory.updatedCard(mapCardServerToClientModel(object as CardServerModel)));
                });
                subscription.on('delete', (object) => {
                    dispatch(ActionFactory.deleteCard(object.id));
                });
                subscription.on('open', () => {
                    createUsersSubscription();
                    cardQuery.find().then((results) => {
                        dispatch(ActionFactory.initializeCards((results as any[]).map(mapCardServerToClientModel)));
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
                    dispatch({
                        type: '@@SCRUMLR/updateBoard',
                        payload: {
                            board: mapBoardServerToClientModel(object.toJSON() as any)
                        }
                    });
                });
                subscription.on('delete', (object) => {
                    dispatch({
                        type: '@@SCRUMLR/deleteBoard'
                    });
                });
                subscription.on('open', () => {
                    createCardsSubscription();
                    boardQuery.first().then((board) => {
                        dispatch({
                            type: '@@SCRUMLR/initBoard',
                            payload: {
                                board: mapBoardServerToClientModel(board?.toJSON() as any),
                            }
                        });
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
    board: (state = { status: 'pending' }, action) => {
        switch (action.type) {
            case '@@SCRUMLR/updateBoard':
            case '@@SCRUMLR/initBoard': {
                return {
                    status: 'ready',
                    data: action.payload.board
                };
            }
            case '@@SCRUMLR/joinBoard': {
                return {
                    status: 'pending'
                }
            }
            case '@@SCRUMLR/initCards': {
                return {
                    ...state
                }
            }
        }
        return state;
    },
    cards: (state: CardClientModel[] = [], action: ReduxAction) => {
        switch (action.type) {
            case ActionType.AddCard: {
                const localCard: CardClientModel = {
                    text: action.text,
                    author: Parse.User.current()!.id,
                    dirty: true
                }
                return [ ...state, localCard ];
            }
            case ActionType.CreatedCard: {
                const newState = [ ...state ];
                const foundExistingCardIndex = newState.findIndex((card) => (!card.id && card.text === action.card.text));
                if (foundExistingCardIndex >= 0) {
                    newState.splice(foundExistingCardIndex, 1, action.card);
                } else {
                    newState.push(action.card);
                }
                return newState;
            }
            case ActionType.DeleteCard: {
                return state.filter((card) => card.id !== action.cardId);
            }
            case ActionType.EditCard: {
                const cardIndex = state.findIndex((card) => card.id === action.cardId);
                return state.splice(cardIndex, 1, {
                    ...state[cardIndex],
                    text: action.text,
                    dirty: true
                });
            }
            case ActionType.UpdatedCard: {
                const cardIndex = state.findIndex((card) => card.id === action.card.id && card.text === action.card.text);
                if (cardIndex >= 0) {
                    return state.splice(cardIndex, 1, action.card);
                }
                return state;
            }
            case ActionType.InitializeCards: {
                return [ ...action.cards ];
            }
        }
        return state;
    },
    users: (state: { admins: UserClientModel[], basic: UserClientModel[], all: UserClientModel[] }  = { admins: [], basic: [], all: [] }, action) => {
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
});

const store = createStore(rootReducer, composeWithDevTools(
    applyMiddleware(thunk),
    applyMiddleware(parseMiddleware)
));

export default store;