const md5 = require('blueimp-md5');

export const authController = (firebase: any) => ({
  signInAnonymously: (email: string) => {
    return firebase
      .auth()
      .signInAnonymously()
      .then((auth: firebase.UserInfo) => {
        const mailHash = email ? md5(email) : md5(`${auth.uid}@scrumlr.io`);
        return firebase.auth().currentUser.updateProfile({
          displayName: email,
          photoURL: `https://www.gravatar.com/avatar/${mailHash}?s=32&d=retro`
        });
      });
  },
  signOut: () => {
    // User is still signed in at this point. Sign out the user and redirect to home page.
    const { uid } = firebase.auth().currentUser as firebase.User;
    firebase.remove(`/presence/${uid}`).then(() => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          location.hash = '/';
        });
    });
  }
});
