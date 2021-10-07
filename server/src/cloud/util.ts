export interface ParseObjectParams {
  [key: string]: any;
}

export const api = <RequestData extends ParseObjectParams = ParseObjectParams, ResponseType = void>(
  name: string,
  call: (user: Parse.User, request: RequestData) => ResponseType | Promise<ResponseType>
) => {
  Parse.Cloud.define<(params: RequestData) => ResponseType | Promise<ResponseType>>(name, (request) => {
    if (!request.user) {
      throw new Error("Not authorized");
    }
    return call(request.user, request.params);
  });
};

export const publicApi = <RequestData extends ParseObjectParams = ParseObjectParams, ResponseType = void>(
  name: string,
  call: (request: RequestData) => ResponseType | Promise<ResponseType>
): void => {
  Parse.Cloud.define<(params: RequestData) => ResponseType | Promise<ResponseType>>(name, (request) => call(request.params));
};

export interface ACL {
  readRoles?: string[];
  writeRoles?: string[];
}

export const newObject = (className: string, data: ParseObjectParams, acl: ACL) => {
  const object = new Parse.Object(className, data);
  const objectACL = new Parse.ACL();
  objectACL.setPublicReadAccess(false);
  objectACL.setPublicWriteAccess(false);
  acl.readRoles?.forEach((role) => {
    objectACL.setRoleReadAccess(role, true);
  });
  acl.writeRoles?.forEach((role) => {
    objectACL.setRoleWriteAccess(role, true);
  });
  object.setACL(objectACL);
  return object;
};
