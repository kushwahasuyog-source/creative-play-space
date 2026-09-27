CREATE TABLE public.bot_chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New chat',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_chat_threads TO authenticated;
GRANT ALL ON public.bot_chat_threads TO service_role;
ALTER TABLE public.bot_chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own threads" ON public.bot_chat_threads FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE INDEX idx_bot_chat_threads_bot ON public.bot_chat_threads (bot_id, updated_at DESC);

CREATE TABLE public.bot_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.bot_chat_threads(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_chat_messages TO authenticated;
GRANT ALL ON public.bot_chat_messages TO service_role;
ALTER TABLE public.bot_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat messages" ON public.bot_chat_messages FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE INDEX idx_bot_chat_messages_thread ON public.bot_chat_messages (thread_id, created_at);