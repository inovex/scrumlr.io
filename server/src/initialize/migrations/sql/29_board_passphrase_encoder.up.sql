UPDATE boards
SET passphrase = '{sha512}' || passphrase
WHERE passphrase IS NOT NULL AND salt IS NOT NULL AND passphrase NOT LIKE '{%}%';
