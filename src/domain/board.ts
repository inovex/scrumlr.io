import { getFirebase } from 'react-redux-firebase';
import { Board, Column, Member, Template } from '../types/state';
import WithId from '../util/withId';

export const addCard = (boardId: string, columnId: string, text?: string) => {
  return getFirebase().firestore().collection('boards').doc(boardId!).collection('cards').add({
    author: getFirebase().auth().currentUser!.uid,
    column: columnId,
    text,
  });
};

export const deleteCard = (boardId: string, columnId: string, cardId: string) => {
  return getFirebase().firestore().collection('boards').doc(boardId!).collection('cards').doc(cardId).delete();
};

export const updateCard = (boardId: string, columnId: string, cardId: string, text?: string) => {
  return getFirebase().firestore().collection('boards').doc(boardId!).collection('cards').doc(cardId).update({
    text,
  });
};

export const addMember = (boardId: string, userUid: string, admin = false) => {
  const member: Member = {
    admin,
    markedAsDone: false,
  };
  return getFirebase().firestore().collection('boards').doc(boardId).collection('members').doc(userUid).set(member);
};

export const addColumn = (boardId: string, columnName: string, visible: boolean) => {
  const column: Column = {
    name: columnName,
    visible,
  };
  return getFirebase().firestore().collection('boards').doc(boardId).collection('columns').add(column);
};

export const createBoard = async (template: WithId<Template>, admissionControl: boolean, encryptedData: boolean) => {
  const firestore = getFirebase().firestore();
  const boardSettings: Board = {
    admissionControl,
    encryptedData,
    owner: getFirebase().auth().currentUser!.uid,
    template: template.id,
    creationDate: new Date().toISOString(),
  };
  const ref = await firestore.collection('boards').add(boardSettings);

  await addMember(ref.id, getFirebase().auth().currentUser!.uid, true);
  await template.columns.forEach((column) => {
    addColumn(ref.id, column.name, column.visible);
  });

  return ref;
};

export const addToAdmissionControl = (boardId: string, userUid: string) => {
  return getFirebase().firestore().collection('boards').doc(boardId).collection('pending').doc(userUid).set({});
};
