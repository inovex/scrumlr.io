ALTER TABLE IF EXISTS board_templates ADD COLUMN modified_at timestamptz DEFAULT now();
