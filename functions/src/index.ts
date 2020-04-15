import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

exports.onResetVoting = functions.firestore.document('boards/{boardId}').onUpdate((change, context) => {
   if (change.before.data()!.voting && !change.after.data()!.voting) {
       db.collection(`boards/${context.params.boardId}/members`).get().then((collection) => {
           collection.forEach((member) => {
               member.ref.update({ votes: null });
           });
       })
   }
});