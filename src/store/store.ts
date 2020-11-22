import {createStore, applyMiddleware, combineReducers, Dispatch, AnyAction} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import Parse from 'parse';
import {mapBoardServerToClientModel} from "../types/board";
import {ApplicationState} from "../types/store";
import {CardClientModel, mapCardServerToClientModel} from "../types/card";


const parseMiddleware = () => (dispatch: Dispatch) => (action: AnyAction) => {
    if (action.type === '@@SCRUMLR/joinBoard') {
        const boardQuery = new Parse.Query('Board');
        boardQuery.equalTo('objectId', action.board);
        boardQuery.subscribe().then((subscription) => {
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
                boardQuery.first().then((board) => {
                    dispatch({
                        type: '@@SCRUMLR/initBoard',
                        payload: {
                            board: mapBoardServerToClientModel(board?.toJSON() as any),
                            closeSubscription: () => { subscription.unsubscribe() }
                        }
                    });
                });
            });
        });

        const cardQuery = new Parse.Query('Card');
        cardQuery.equalTo('board', Parse.Object.extend('Board').createWithoutData(action.board));
        cardQuery.subscribe().then((subscription) => {
            subscription.on('create', (object) => {
                dispatch({
                    type: '@@SCRUMLR/createCard',
                    payload: {
                        card: object
                    }
                })
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
                dispatch({
                    type: '@@SCRUMLR/deleteCard',
                    payload: {
                        card: object
                    }
                });
            });
            subscription.on('open', () => {
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

        /*const votesQuery = new Parse.Query(' Vote');
        votesQuery.equalTo('board', Parse.Object.extend('Board').createWithoutData(action.board));
        votesQuery.subscribe().then((subscription) => {

        });*/
    }

    return dispatch(action);
}

const rootReducer = combineReducers<ApplicationState>({
    board: (state = { status: 'pending'}, action) => {
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
        }
        return state;
    },
    cards: (state: CardClientModel[] = [], action) => {
        switch (action.type) {
            case '@@SCRUMLR/initCards': {
                return [ ...action.payload.cards.map(mapCardServerToClientModel) ];
            }
            case '@@SCRUMLR/createCard': {
                return [ ...state, mapCardServerToClientModel(action.payload.card) ];
            }
            case '@@SCRUMLR/updateCard': {
                const cardId = action.payload.card.id;
                const cardIndex = state.findIndex((card) => card.id === cardId);
                return state.splice(cardIndex, 1, mapCardServerToClientModel(action.payload.card));
            }
            case '@@SCRUMLR/deleteCard': {
                const cardId = action.payload.card.id;
                return state.filter((card) => card.id !== cardId);
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