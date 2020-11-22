import Parse from 'parse';

export interface CardServerModel extends Parse.Object {
    text: string;
    author: Parse.Object;
}

export interface CardClientModel {
    id: string;
    text: string;
    author: string;
}

export const mapCardServerToClientModel = (card: CardServerModel): CardClientModel => ({
    id: card.id,
    text: card.get('text'),
    author: card.get('author').id
});