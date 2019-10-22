export const getCapitalLetter = (text?: string | null | undefined) => {
  // string iterator correctly handles emojis but will break with grapheme clusters but still look ok-ish
  // see https://stackoverflow.com/questions/46157867/how-to-get-the-nth-unicode-character-from-a-string-in-javascript
  // handle undefined (not iterable) and empty string (empty array)
  return ([...(text || '')][0] || '').toUpperCase();
};

export const getResidualUsername = (username?: string | null | undefined) => {
  // simple check for unicode special chars like emojis
  //
  if (getCapitalLetter(username).length > 1) {
    return [...username].slice(1).join('');
  }

  return username;
};
