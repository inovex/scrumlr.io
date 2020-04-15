import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

exports.onResetVoting = functions.firestore.document('boards/{boardId}').onUpdate((change, context) => {
   if (change.before.data()!.voting && !change.after.data()!.voting) {
       const boardId = context.params.boardId;
       db.collection(`boards/${boardId}/members`).get().then((collection) => {
           collection.forEach((member) => {
               member.ref.update({ votes: null }).catch((reason) => {
                   console.error(`failed to reset votes for member ${member.id} on board ${boardId}`, reason);
               });
           });
       }).catch((reason) => {
           console.error(`could not retrieve members from board ${boardId}`, reason);
       });
   }
});