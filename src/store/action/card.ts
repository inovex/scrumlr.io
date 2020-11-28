import {CardClientModel} from "../../types/card";

/** This object lists card object specific internal Redux Action types. */
export const CardActionType = {
    /*
     * ATTENTION:
     * Don't forget the `as` casting for each field, because the type inference
     * won't work otherwise (e.g. in reducers).
     */
    AddCard: '@@SCRUMLR/addCard' as '@@SCRUMLR/addCard',
    EditCard: '@@SCRUMLR/editCard' as '@@SCRUMLR/editCard',
    CreatedCard: '@@SCRUMLR/createCard' as '@@SCRUMLR/createCard',
    DeleteCard: '@@SCRUMLR/deleteCard' as '@@SCRUMLR/deleteCard',
    UpdatedCard: '@@SCRUMLR/updatedCard' as '@@SCRUMLR/updatedCard',
    InitializeCards: '@@SCRUMLR/initCards' as '@@SCRUMLR/initCards'
}

/** Factory or creator class of internal Redux card object specific actions. */
export const CardActionFactory = {
    /*
     * ATTENTION:
     * Each action creator should be also listed in the type `CardReduxAction`, because
     * the type inference won't work otherwise (e.g. in reducers).
     */
    addCard: (boardId: string, text: string) => ({
        type: CardActionType.AddCard,
        text
    }),
    editCard: (cardId: string, text: string) => ({
        type: CardActionType.EditCard,
        cardId,
        text
    }),
    createdCard: (card: CardClientModel) => ({
        type: CardActionType.CreatedCard,
        card
    }),
    deleteCard: (cardId: string) => ({
        type: CardActionType.DeleteCard,
        cardId
    }),
    updatedCard: (card: CardClientModel) => ({
        type: CardActionType.UpdatedCard,
        card
    }),
    initializeCards: (cards: CardClientModel[]) => ({
        type: CardActionType.InitializeCards,
        cards
    })
}

export type CardReduxAction =
    | ReturnType<typeof CardActionFactory.addCard>
    | ReturnType<typeof CardActionFactory.editCard>
    | ReturnType<typeof CardActionFactory.createdCard>
    | ReturnType<typeof CardActionFactory.deleteCard>
    | ReturnType<typeof CardActionFactory.initializeCards>
    | ReturnType<typeof CardActionFactory.updatedCard>



