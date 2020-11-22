import Parse from "parse";

export const addCard = async (board: string, text: string) => {
    return await Parse.Cloud.run('addCard', { board, text });
}

export const deleteCard = async (board: string, card: string) => {
    return await Parse.Cloud.run('deleteCard', { board, card });
}