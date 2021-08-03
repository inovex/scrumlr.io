export interface UserServerModel {
  objectId: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserClientModel {
  id: string;
  displayName: string;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date;
  online: boolean;
}

export const mapUserServerToClientModel = (user: UserServerModel, {admin, online}: {admin: boolean; online: boolean}): UserClientModel => ({
  id: user.objectId,
  displayName: user.displayName,
  admin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  online,
});
