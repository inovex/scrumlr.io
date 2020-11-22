export interface BoardServerModel {
    objectId: string;
    joinConfirmationRequired: boolean;
    encryptedContent: boolean;
    showContentOfOtherUsers: boolean;
    showAuthors: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BoardClientModel {
    id: string;
    joinConfirmationRequired: boolean;
    encryptedContent: boolean;
    showContentOfOtherUsers: boolean;
    showAuthors: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const mapBoardServerToClientModel = (board: BoardServerModel): BoardClientModel => ({
    id: board.objectId,
    joinConfirmationRequired: board.joinConfirmationRequired,
    encryptedContent: board.encryptedContent,
    showContentOfOtherUsers: board.showContentOfOtherUsers,
    showAuthors: board.showAuthors,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
});