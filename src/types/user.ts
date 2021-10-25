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
  ready: boolean;
  online: boolean;
}

type EditableUserConfiguration = {
  showHiddenColumns: boolean;
};

export type UserConfigurationServerModel = {
  [userId: string]: {
    showHiddenColumns: boolean;
  };
};

export type UserConfigurationClientModel = {
  id: string;
  showHiddenColumns: boolean;
};

export type EditUserConfigurationRequest = Partial<EditableUserConfiguration>;

export const mapUserServerToClientModel = (user: UserServerModel, {admin, online}: {admin: boolean; online: boolean}): UserClientModel => ({
  id: user.objectId,
  displayName: user.displayName,
  admin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  ready: false,
  online,
});
