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
  }
});
