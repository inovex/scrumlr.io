import * as Raven from "raven-js";

const functions = require('firebase-functions');
const admin = require("firebase-admin");

const cleanupDatabase = (exitFunction) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - 7);
  console.log('expiration data set to ', expirationDate.toISOString());

  const toDelete = [];

  const app = admin.initializeApp();
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

exports.deleteUserData = functions.https.onCall((data, context) => {
  const userId = data.userId;

  const toUpdate = [];

  const app = admin.initializeApp();
  const query = admin.database().ref('/boards');
  return query.once("value")
      .then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const childData = childSnapshot.val();

          if (childData.private.users[userId]) {

            toUpdate.push(childSnapshot.child('private/users/' + userId).remove());

            // Obfuscate username and userId in cards written by that user
            Object.keys(childData.private.cards).forEach((cardId) => {
              if (childData.private.cards[cardId].authorUid === userId) {
                toUpdate.push(childSnapshot.child('private/cards/' + cardId).update({
                  authorUid: '0000000',
                  author: '???'
                }));
              }
            })
          }
        });
      }).then(() => {
        Promise.all(toUpdate).then((values) => {
          console.log(`deleted ${values.length} entries`);
          app.delete().catch((error) => {
            console.error('unable to stop app', error);
          });
        }).then(() => exitFunction());
      });
});




