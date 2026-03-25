-- zkrune Todo Bot table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS bot_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL,
  task TEXT NOT NULL,
  added_by TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_todos_chat ON bot_todos(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_todos_done ON bot_todos(done);

-- RLS
ALTER TABLE bot_todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access bot_todos" ON bot_todos;
CREATE POLICY "Service role full access bot_todos" ON bot_todos
  USING (true) WITH CHECK (true);
