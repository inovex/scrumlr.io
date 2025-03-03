UPDATE google_users
SET avatar_url = CASE
    WHEN LENGTH(avatar_url) > 256 THEN 'https://httpcats.com/404.jpg'
    ELSE avatar_url
END;

ALTER TABLE google_users
ALTER COLUMN avatar_url TYPE varchar(256);
