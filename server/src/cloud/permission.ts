export const getAdminRoleName = (boardId: string) => {
    return `admin_of_${boardId}`;
}

export const getMemberRoleName = (boardId: string) => {
    return `member_of_${boardId}`;
}

export const isAdmin = async (user: Parse.User, boardId: string) => {
    const adminRoleQuery = new Parse.Query(Parse.Role);
    adminRoleQuery.equalTo('name', getAdminRoleName(boardId));
    adminRoleQuery.equalTo('users', user);

    return Boolean(await adminRoleQuery.first({ useMasterKey: true }));
}

export const isOnline = (user: Parse.User, boardId: string) => {
  return (user.get('boards') as string[])?.indexOf(boardId) >= 0;
}

export const isMember = async (user: Parse.User, boardId: string) => {
    const adminRoleQuery = new Parse.Query(Parse.Role);
    adminRoleQuery.equalTo('name', getAdminRoleName(boardId));
    adminRoleQuery.equalTo('users', user);

    const memberRoleQuery = new Parse.Query(Parse.Role);
    memberRoleQuery.equalTo('name', getMemberRoleName(boardId));
    memberRoleQuery.equalTo('users', user);

    const combinedQuery = Parse.Query.or(adminRoleQuery, memberRoleQuery).limit(1);
    return Boolean(await combinedQuery.first({ useMasterKey: true }));
}

export const requireValidBoardMember = async (user: Parse.User, boardId: string) => {
    if (!await isMember(user, boardId)) {
        throw new Error(`User ${user} is not permitted to access board '${boardId}'`);
    }
}
export const requireValidBoardAdmin = async (user: Parse.User, boardId: string) => {
    if (!await isAdmin(user, boardId)) {
        throw new Error(`User ${user} is not permitted to access board '${boardId}'`);
    }
}