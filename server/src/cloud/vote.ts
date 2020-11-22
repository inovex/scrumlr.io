import {requireValidBoardMember, getMemberRoleName} from "./permission";
import {api, newObject} from "./util";

export interface VoteRequest {
    board: string;
    card: string;
}

export const initializeVoteFunctions = () => {
    api<VoteRequest, boolean>('addVote', async (user, request) => {
        await requireValidBoardMember(user, request.board);

        const board = Parse.Object.extend('Board').createWithoutData(request.board);
        const card = Parse.Object.extend('Card').createWithoutData(request.card);
        const vote = newObject('Vote', { board, card, user }, { readRoles: [ getMemberRoleName(board) ]});

        await vote.save(null, { useMasterKey: true });
        return true;
    });

    api<VoteRequest, boolean>('removeVote', async (user, request) => {
        const card = Parse.Object.extend('Card').createWithoutData(request.card);

        const voteQuery = new Parse.Query('Vote');
        voteQuery.equalTo('card', card);
        voteQuery.equalTo('user', user);
        const vote = await voteQuery.limit(1).first({ useMasterKey: true });
        if (vote) {
            await vote.destroy({ useMasterKey: true });
            return true;
        }

        throw new Error(`No votes for user '${user.id}' exist on card '${request.card}'`);
    });
}