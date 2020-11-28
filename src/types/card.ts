import Parse from 'parse';

export interface CardServerModel extends Parse.Object {
    text: string;
    author: Parse.Object;
    createdAt: Date;
    updatedAt: Date;
}

export interface CardClientModel {
    id?: string;
    text: string;
    author: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const mapCardServerToClientModel = (card: CardServerModel): CardClientModel => ({
    id: card.id,
    text: card.get('text'),
    author: card.get('author').id,
    createdAt: card.get('createdAt'),
    updatedAt: card.get('updatedAt'),
});