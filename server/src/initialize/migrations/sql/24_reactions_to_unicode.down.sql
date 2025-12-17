/*
  revert unicode emoji reactions back to legacy string identifiers.
  any reactions that are not part of the legacy set will be deleted.
*/
BEGIN;

-- delete any reactions that cannot be mapped back to a legacy identifier
DELETE
FROM reactions
WHERE reaction_type NOT IN ('🤔', '❤️', '👍', '👎', '😂', '🎉', '💩');

-- map supported emojis back to the legacy strings
UPDATE reactions
SET reaction_type = CASE reaction_type
                      WHEN '🤔' THEN 'thinking'
                      WHEN '❤️' THEN 'heart'
                      WHEN '👍' THEN 'like'
                      WHEN '👎' THEN 'dislike'
                      WHEN '😂' THEN 'joy'
                      WHEN '🎉' THEN 'celebration'
                      WHEN '💩' THEN 'poop'
                      ELSE reaction_type
  END;

COMMIT;
