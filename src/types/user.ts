export interface UserServerModel {
    objectId: string;
    displayName: string;
}

export interface UserClientModel {
    id: string;
    displayName: string;
    admin: boolean;
}

export const mapUserServerToClientModel = (user: UserServerModel, admin: boolean): UserClientModel => ({
    id: user.objectId,
    displayName: user.displayName,
    admin
});