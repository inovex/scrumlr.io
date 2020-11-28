import {createStore, applyMiddleware, combineReducers, Dispatch, AnyAction, MiddlewareAPI} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import Parse from 'parse';
import {mapBoardServerToClientModel} from "../types/board";
import {ApplicationState} from "../types/store";
import {CardClientModel, CardServerModel, mapCardServerToClientModel} from "../types/card";
import {mapUserServerToClientModel, UserClientModel} from "../types/user";
import {
    Actions,
    ADD_CARD,
    AddCardAction,
    CREATED_CARD,
    CreatedCardAction,
    DELETE_CARD, DeleteCardAction,
    JOIN_BOARD,
    LEAVE_BOARD
} from "./actions";

let closeSubscriptions: Function[] = [];

const parseMiddleware = (stateAPI: MiddlewareAPI<any, ApplicationState>) => (dispatch: Dispatch) => (action: AnyAction) => {
    if (action.type === LEAVE_BOARD) {
        closeSubscriptions.forEach((closeCallback) => closeCallback());
        closeSubscriptions = [];
    }

    if (action.type === ADD_CARD) {
        const addCardAction = action as AddCardAction;
        const boardId = stateAPI.getState().board.data!.id;
        Parse.Cloud.run('addCard', { board: boardId, text: addCardAction.text });
    }

    if (action.type === DELETE_CARD) {
        const deleteCardAction = action as DeleteCardAction;
        const boardId = stateAPI.getState().board.data!.id;
        Parse.Cloud.run('deleteCard', { board: boardId, card: deleteCardAction.cardId });
    }

    if (action.type === JOIN_BOARD) {
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
            cardQuery.equalTo('board', Parse.Object.extend('Board').createWithoutData(action.board));
            cardQuery.subscribe().then((subscription) => {
                closeSubscriptions.push(() => { subscription.unsubscribe() });
                subscription.on('create', (object) => {
                    dispatch(Actions.createdCard(mapCardServerToClientModel(object as CardServerModel)))
                });
                subscription.on('update', (object) => {
                    dispatch({
                        type: '@@SCRUMLR/updateCard',
                        payload: {
                            card: object
                        }
                    });
                });
                subscription.on('delete', (object) => {
                    dispatch(Actions.deleteCard(object.id));
                });
                subscription.on('open', () => {
                    createUsersSubscription();
                    cardQuery.find().then((results) => {
                        dispatch({
                            type: '@@SCRUMLR/initCards',
                            payload: {
                                cards: results,
                                closeSubscription: () => { subscription.unsubscribe() }
                            }
                        })
                    });
                });
            });
        }

        const createBoardSubscription = () => {
            const boardQuery = new Parse.Query('Board');
            boardQuery.equalTo('objectId', action.board);
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
    cards: (state: CardClientModel[] = [], action) => {
        switch (action.type) {
            case ADD_CARD: {
                const addCardAction = action as AddCardAction;
                const localCard: CardClientModel = {
                    text: addCardAction.text,
                    author: Parse.User.current()!.id
                }
                return [ ...state, localCard ];
            }
            case CREATED_CARD: {
                const newState = [ ...state ];
                const createdCardAction = action as CreatedCardAction;
                const foundExistingCardIndex = newState.findIndex((card) => (!card.id && card.text === createdCardAction.card.text));
                if (foundExistingCardIndex >= 0) {
                    newState.splice(foundExistingCardIndex, 1, createdCardAction.card);
                } else {
                    newState.push(createdCardAction.card);
                }
                return newState;
            }
            case DELETE_CARD: {
                const deleteCardAction = action as DeleteCardAction;
                return state.filter((card) => card.id !== deleteCardAction.cardId);
            }
            case '@@SCRUMLR/initCards': {
                return [ ...action.payload.cards.map(mapCardServerToClientModel) ];
            }
            case '@@SCRUMLR/updateCard': {
                const cardId = action.payload.card.id;
                const cardIndex = state.findIndex((card) => card.id === cardId);
                return state.splice(cardIndex, 1, mapCardServerToClientModel(action.payload.card));
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