import {getAdminRoleName, getMemberRoleName, isAdmin, isMember, requireValidBoardMember} from "./permission";
import {api, newObject} from "./util";

interface AddCardRequest {
    board: string;
    text: string;
}

interface EditCardRequest {
    board: string;
    card: string;
    text: string;
}

interface DeleteCardRequest {
    board: string;
    card: string;
}

export const initializeCardFunctions = () => {
    api<AddCardRequest, boolean>('addCard', async (user, request) => {
        await requireValidBoardMember(user, request.board);
        const card = newObject('Card',
            {
                text: request.text,
                author: user,
                board: Parse.Object.extend("Board").createWithoutData(request.board)
            },
            {
                readRoles: [ getMemberRoleName(request.board), getAdminRoleName(request.board) ],
                writeRoles: [ getAdminRoleName(request.board) ]
            }
        );
        await card.save(null, { useMasterKey: true });
        return true;
    });

    api<EditCardRequest, boolean>('editCard', async (user, request) => {
        const board = Parse.Object.extend("Board").createWithoutData(request.board);

        const query = new Parse.Query(Parse.Object.extend('Card'));
        const card = await query.get(request.card, { useMasterKey: true });

        if (await isAdmin(user, request.board) || user.id === card.get('author').id) {
            card.set('text', request.text);
            await card.save(null, { useMasterKey: true });
            return true;
        }

        throw new Error(`Not authorized to edit card '${request.card}'`);
    })

    api<DeleteCardRequest, boolean>('deleteCard', async (user, request) => {
        const board = Parse.Object.extend("Board").createWithoutData(request.board);

        const query = new Parse.Query(Parse.Object.extend('Card'));
        const card = await query.get(request.card, { useMasterKey: true });

        if (await isAdmin(user, request.board) || user.id === card.get('author').id) {
            const voteQuery = await new Parse.Query('Vote');
            voteQuery.equalTo('card', card);
            voteQuery.equalTo('board', board);
            await Parse.Object.destroyAll([card, ...await voteQuery.find({ useMasterKey: true })], { useMasterKey: true });
            return true;
        }

        throw new Error(`Not authorized to delete card '${request.card}'`);
    });
}