UPDATE boards
SET passphrase = replace(passphrase, '{sha512}', '')
WHERE passphrase IS NOT NULL AND salt IS NOT NULL AND passphrase LIKE '{sha512}%';
