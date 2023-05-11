/* this table includes all reactions that have been made to notes.
    every reaction is bound to a note that it sits on, as well as
    the user that made the reaction. */
CREATE TABLE reactions (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "note" UUID NOT NULL REFERENCES notes ON DELETE CASCADE,
    "user" UUID NOT NULL REFERENCES users ON DELETE CASCADE,
    /* CLDR short name in order to allow custom emojis */
    "reaction_type" VARCHAR(50) NOT NULL
);

/* creating the index on notes so we find the reactions for that note faster */
CREATE INDEX reactions_note_index ON reactions (note);
