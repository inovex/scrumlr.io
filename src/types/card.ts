import Parse from 'parse';

/**
 * The representation of a card on the server.
 */
export interface CardServerModel extends Parse.Object {
    text: string;
    author: Parse.Object;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * The representation of a card on the client.
 */
export interface CardClientModel {

    /** The id of the card or `undefined` if yet to be persisted. */
    id?: string;

    /** The text of the card. */
    text: string;

    /** The user author of this card. */
    author: string;

    /** The creation date of this object. */
    createdAt?: Date;

    /** The last update date of this object. */
    updatedAt?: Date;

    /**
     * This flag indicated whether local changes have yet to be persisted.
     * It is set to `true` if some fields aren't persisted yet and `false` otherwise.
     */
    dirty: boolean;
}

export const mapCardServerToClientModel = (card: CardServerModel): CardClientModel => ({
    id: card.id,
    text: card.get('text'),
    author: card.get('author').id,
    createdAt: card.get('createdAt'),
    updatedAt: card.get('updatedAt'),
    dirty: false
});