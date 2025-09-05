-- during development, we realized that templates actually shouldn't hold the access policy, but only boards
ALTER TABLE IF EXISTS board_templates
  DROP COLUMN IF EXISTS access_policy;
