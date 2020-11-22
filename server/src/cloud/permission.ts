export const getAdminRoleName = (board: string) => {
    return `admin_of_${board}`;
}

export const getMemberRoleName = (board: string) => {
    return `member_of_${board}`;
}

export const isAdmin = async (user: Parse.User, board: string) => {
    const adminRoleQuery = new Parse.Query(Parse.Role);
    adminRoleQuery.equalTo('name', getAdminRoleName(board));
    adminRoleQuery.equalTo('users', user);

    return Boolean(await adminRoleQuery.first({ useMasterKey: true }));
}

export const isMember = async (user: Parse.User, board: string) => {
    const adminRoleQuery = new Parse.Query(Parse.Role);
    adminRoleQuery.equalTo('name', getAdminRoleName(board));
    adminRoleQuery.equalTo('users', user);

    const memberRoleQuery = new Parse.Query(Parse.Role);
    memberRoleQuery.equalTo('name', getMemberRoleName(board));
    memberRoleQuery.equalTo('users', user);

    const combinedQuery = Parse.Query.or(adminRoleQuery, memberRoleQuery).limit(1);
    return Boolean(await combinedQuery.first({ useMasterKey: true }));
}

export const requireValidBoardMember = async (user: Parse.User, board: string) => {
    if (!await isMember(user, board)) {
        throw new Error(`User ${user} is not permitted to access board '${board}'`);
    }
}
export const requireValidBoardAdmin = async (user: Parse.User, board: string) => {
    if (!await isAdmin(user, board)) {
        throw new Error(`User ${user} is not permitted to access board '${board}'`);
    }
}