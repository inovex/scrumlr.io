import md5 = require('blueimp-md5');

export const getGravatar = (uid: string, email?: string) => {
  const mailHash = email ? md5(email) : md5(`${uid}@scrumlr.io`);
  return `https://www.gravatar.com/avatar/${mailHash}?s=32&d=retro`;
};
