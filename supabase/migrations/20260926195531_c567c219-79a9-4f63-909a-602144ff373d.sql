CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  starter_prompt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.templates TO authenticated;
GRANT SELECT ON public.templates TO anon;
GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates readable" ON public.templates FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled bot',
  prompt text NOT NULL DEFAULT '',
  spec jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  token_cipher text,
  token_hint text,
  telegram_username text,
  template_slug text,
  message_count integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bots_owner ON public.bots (owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bots TO authenticated;
GRANT ALL ON public.bots TO service_role;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bots select" ON public.bots FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "own bots insert" ON public.bots FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "own bots update" ON public.bots FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "own bots delete" ON public.bots FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.bot_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  command text NOT NULL,
  description text NOT NULL DEFAULT '',
  reply text NOT NULL DEFAULT '',
  use_ai boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bot_commands_bot ON public.bot_commands (bot_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_commands TO authenticated;
GRANT ALL ON public.bot_commands TO service_role;
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own commands select" ON public.bot_commands FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "own commands insert" ON public.bot_commands FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "own commands update" ON public.bot_commands FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "own commands delete" ON public.bot_commands FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.bot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  telegram_chat_id bigint,
  telegram_user text,
  direction text NOT NULL DEFAULT 'in',
  text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bot_messages_bot ON public.bot_messages (bot_id, created_at DESC);
GRANT SELECT, DELETE ON public.bot_messages TO authenticated;
GRANT ALL ON public.bot_messages TO service_role;
ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages select" ON public.bot_messages FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "own messages delete" ON public.bot_messages FOR DELETE TO authenticated USING (auth.uid() = owner_id);

INSERT INTO public.templates (slug, name, category, description, starter_prompt) VALUES
('file-converter','File Converter Bot','Utility','Accepts files and converts them between formats.','A Telegram bot that accepts images and documents from users and converts them to PDF, confirming each step.'),
('ai-chat','AI Chat Bot','AI','A conversational assistant powered by AI.','A friendly Telegram bot that answers any question conversationally using AI, with a /help command explaining what it can do.'),
('group-moderation','Group Moderation Bot','Moderation','Keeps group chats clean with rules and warnings.','A Telegram group moderation bot that warns users who post banned words, explains the group rules on /rules, and welcomes new members.'),
('welcome','Welcome Bot','Community','Greets new members with a custom message.','A Telegram bot that greets every new member of a group with a warm welcome message and a short list of useful links.'),
('url-shortener','URL Shortener Bot','Productivity','Turns long links into short ones.','A Telegram bot that takes any URL a user sends and replies with a shortened link, plus a /stats command.'),
('qr-generator','QR Generator Bot','Utility','Creates QR codes from text or links.','A Telegram bot that turns any text or link a user sends into a QR code image and explains usage on /start.'),
('reminder','Reminder Bot','Productivity','Schedules reminders for users.','A Telegram bot that lets users set reminders in plain language, lists their reminders on /list and cancels them on /cancel.'),
('quiz','Quiz Bot','Education','Runs quizzes and keeps score.','A Telegram quiz bot that asks multiple-choice trivia questions, keeps score per user, and shows a leaderboard on /score.');