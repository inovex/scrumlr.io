import {CardClientModel} from "../types/card";

export const ActionTypes = {
    LeaveBoard: '@@SCRUMLR/leaveBoard' as '@@SCRUMLR/leaveBoard',
    JoinBoard: '@@SCRUMLR/joinBoard' as '@@SCRUMLR/joinBoard',
    AddCard: '@@SCRUMLR/addCard' as '@@SCRUMLR/addCard',
    CreatedCard: '@@SCRUMLR/createCard' as '@@SCRUMLR/createCard',
    DeleteCard: '@@SCRUMLR/deleteCard' as '@@SCRUMLR/deleteCard',
    UpdateCard: '@@SCRUMLR/updateCard' as '@@SCRUMLR/updateCard',
    InitializeCards: '@@SCRUMLR/initCards' as '@@SCRUMLR/initCards'
}

export const Actions = {
    leaveBoard: () => ({
        type: ActionTypes.LeaveBoard
    }),
    joinBoard: (board: string) => ({
        type: ActionTypes.JoinBoard,
        boardId: board
    }),
    addCard: (boardId: string, text: string) => ({
        type: ActionTypes.AddCard,
        text
    }),
    createdCard: (card: CardClientModel) => ({
        type: ActionTypes.CreatedCard,
        card
    }),
    deleteCard: (cardId: string) => ({
        type: ActionTypes.DeleteCard,
        cardId
    }),
    updateCard: (card: CardClientModel) => ({
        type: ActionTypes.UpdateCard,
        card
    }),
    initializeCards: (cards: CardClientModel[]) => ({
        type: ActionTypes.InitializeCards,
        cards
    })
}

export type ReduxAction =
    | ReturnType<typeof Actions.leaveBoard>
    | ReturnType<typeof Actions.joinBoard>
    | ReturnType<typeof Actions.addCard>
    | ReturnType<typeof Actions.createdCard>
    | ReturnType<typeof Actions.deleteCard>
    | ReturnType<typeof Actions.initializeCards>
    | ReturnType<typeof Actions.updateCard>



