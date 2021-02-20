const functions = require('firebase-functions');
const admin = require("firebase-admin");
const app = admin.initializeApp();

const cleanupDatabase = (exitFunction) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 7);
    console.log('expiration data set to ', expirationDate.toISOString());

    const toDelete = [];

    const query = admin.database().ref('/boards');
    return query.once("value")
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const childData = childSnapshot.val();
                if (!childData.private || !childData.private.config || !childData.private.config.created || !childData.private.users || !childData.private.cards || (new Date(childData.private.config.created).getTime() < expirationDate.getTime() && (Object.keys(childData.private.users).length === 1 || Object.keys(childData.private.cards).length === 0))) {
                    toDelete.push(childSnapshot.ref.remove());
                }
            });
        }).then(() => {
            Promise.all(toDelete).then((values) => {
                console.log(`deleted ${values.length} entries`);
                app.delete().catch((error) => {
                    console.error('unable to stop app', error);
                });
            }).then(() => exitFunction());
        });
};

exports.cleanupDatabase = functions.https.onRequest((request, response) => {
    cleanupDatabase(() => {
        response.send("OK");
    }).catch((error) => {
        console.log('unable to finish cleanup', error);
    });
});

exports.scheduledDatabaseCleanup = functions.pubsub.schedule('30 3 * * *').onRun((context) => {
    cleanupDatabase(() => {
        console.log("Finished cleanup");
    }).catch((error) => {
        console.log('unable to finish cleanup', error);
    });
});

exports.detectStackCycle = functions.database.ref('/boards/{boardId}/private/cards/{cardId}')
    .onUpdate((change, context) => {
        const oldValue = change.before.val();
        const newValue = change.after.val();

        if (newValue.parent === oldValue.parent) {
            // proceed with the storage
        } else if (!!newValue.parent) {
            const query = admin.database().ref(`/boards/${context.params.boardId}/private/cards`);

            return query.once("value")
                .then((snapshot) => {
                    const cards = snapshot.val();

                    let nextToVisit = newValue.parent;
                    const cycle = [context.params.cardId];

                    while (nextToVisit) {
                        nextToVisit = cards[nextToVisit].parent;

                        if (cycle.indexOf(nextToVisit) >= 0) {
                            // cycle detected
                            let previousValue = oldValue.parent;
                            if (!previousValue) {
                                previousValue = null;
                            }
                            return change.after.ref.update({ parent: previousValue });
                        } else {
                            cycle.push(nextToVisit);
                        }
                    }
                });
        }

        return true;
    });





