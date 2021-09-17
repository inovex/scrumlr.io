export interface UserServerModel {
  objectId: string;
  displayName: string;
  showHiddenColumns: boolean;
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
  showHiddenColumns: boolean;
}

type EditableUserConfiguration = {
  showHiddenColumns: boolean;
};

export type EditUserConfigurationRequest = Partial<EditableUserConfiguration>;

export const mapUserServerToClientModel = (user: UserServerModel, {admin, online}: {admin: boolean; online: boolean}): UserClientModel => ({
  id: user.objectId,
  displayName: user.displayName,
  admin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  online,
  showHiddenColumns: user.showHiddenColumns,
});
