/* convert legacy reaction type identifiers to their unicode emoji counterparts. */
BEGIN;

UPDATE reactions
SET reaction_type = CASE reaction_type
                      WHEN 'thinking' THEN '🤔'
                      WHEN 'heart' THEN '❤️'
                      WHEN 'like' THEN '👍'
                      WHEN 'dislike' THEN '👎'
                      WHEN 'joy' THEN '😂'
                      WHEN 'celebration' THEN '🎉'
                      WHEN 'poop' THEN '💩'
                      ELSE reaction_type
  END;

COMMIT;
