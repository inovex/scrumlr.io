import {getAdminRoleName, getMemberRoleName, isAdmin, isMember, requireValidBoardMember} from "./permission";
import {api, newObject} from "./util";

interface AddNoteRequest {
    board: string;
    text: string;
}

interface EditNoteRequest {
    board: string;
    note: string;
    text: string;
}

interface DeleteNoteRequest {
    board: string;
    note: string;
}

export const initializeNoteFunctions = () => {
    api<AddNoteRequest, boolean>('addNote', async (user, request) => {
        await requireValidBoardMember(user, request.board);
        const note = newObject('Note',
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
        await note.save(null, { useMasterKey: true });
        return true;
    });

    api<EditNoteRequest, boolean>('editNote', async (user, request) => {
        const board = Parse.Object.extend("Board").createWithoutData(request.board);

        const query = new Parse.Query(Parse.Object.extend('Note'));
        const note = await query.get(request.note, { useMasterKey: true });

        if (await isAdmin(user, request.board) || user.id === note.get('author').id) {
            note.set('text', request.text);
            await note.save(null, { useMasterKey: true });
            return true;
        }

        throw new Error(`Not authorized to edit note '${request.note}'`);
    })

    api<DeleteNoteRequest, boolean>('deleteNote', async (user, request) => {
        const board = Parse.Object.extend("Board").createWithoutData(request.board);

        const query = new Parse.Query(Parse.Object.extend('Note'));
        const note = await query.get(request.note, { useMasterKey: true });

        if (await isAdmin(user, request.board) || user.id === note.get('author').id) {
            const voteQuery = await new Parse.Query('Vote');
            voteQuery.equalTo('note', note);
            voteQuery.equalTo('board', board);
            await Parse.Object.destroyAll([note, ...await voteQuery.find({ useMasterKey: true })], { useMasterKey: true });
            return true;
        }

        throw new Error(`Not authorized to delete note '${request.note}'`);
    });
}