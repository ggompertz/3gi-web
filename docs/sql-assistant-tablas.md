# SQL: Tablas para 3GI Assistant

Ejecutar en: https://supabase.com/dashboard/project/rfvhiuyqtfpqzjwpumav/sql/new

```sql
CREATE TABLE IF NOT EXISTS assistant_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  tokens_used int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_sessions_user_created 
  ON assistant_sessions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS assistant_memory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```
