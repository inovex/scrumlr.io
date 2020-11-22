import Parse from 'parse/node';

const addInitialBoardSchema = async () => {
    const schema = new Parse.Schema('Board');
    schema.addString('name');
    schema.addBoolean('joinConfirmationRequired', { defaultValue: false });
    schema.addBoolean('encryptedContent', { defaultValue: false });
    schema.addString('accessCode');
    schema.addBoolean('showContentOfOtherUsers', { defaultValue: true });
    schema.addBoolean('showAuthors', { defaultValue: true });
    schema.addDate('timerUTCEndTime');
    schema.addDate('expirationUTCTime');
    schema.addObject('voting');
    // TODO add template reference / columns
    schema.addNumber('schemaVersion', { required: true, defaultValue: 1 });
    return schema.save();
}

const addInitialCardSchema = async () => {
    const schema = new Parse.Schema('Card');
    schema.addString('text', { required: true });
    schema.addPointer('author', '_User', { required: true });
    schema.addPointer('board', 'Board', { required: true });
    schema.addNumber('schemaVersion', { required: true, defaultValue: 1 });
    return schema.save();
}

const addInitialJoinRequestSchema = async () => {
    const schema = new Parse.Schema('JoinRequest');
    schema.addPointer('user', '_User', { required: true });
    schema.addPointer('board', 'Board', { required: true });
    schema.addString('status', { required: true, defaultValue: 'pending'});
    schema.addString('accessKey');
    schema.addNumber('schemaVersion', { required: true, defaultValue: 1 });
    return schema.save();
}

const addInitialVote = async () => {
    const schema = new Parse.Schema('BoardSession');
    schema.addPointer('board', 'Board', { required: true });
    schema.addPointer('card', 'Card', { required: true });
    schema.addPointer('user', '_User', { required: true });
    schema.addNumber('schemaVersion', { required: true, defaultValue: 1 });
    return schema.save();
}

export const initServer = async (appId: string, serverUrl: string, masterKey: string) => {
    Parse.initialize(appId);
    Parse.serverURL = serverUrl
    Parse.masterKey = masterKey;

    const config = await Parse.Config.get({ useMasterKey: true });
    const versions = config.get('versions');
    if (!versions) {
        await addInitialBoardSchema();
        await addInitialCardSchema();
        await addInitialJoinRequestSchema();
        await addInitialVote();
        console.log('Initialized schema');

        await Parse.Config.save({
            versions: {
                Board: 1,
                Card: 1,
                JoinRequest: 1,
                Vote: 1
            }
        });
    }

    // check for schema versions and migrate schemes here
    // if (versions.Board === 1) { ... }
}