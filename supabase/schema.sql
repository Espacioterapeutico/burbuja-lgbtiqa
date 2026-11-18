-- ================================================================
-- BURBUJA LGBTIQA+ - SCHEMA OFICIAL DE BASE DE DATOS (SUPABASE)
-- ================================================================

-- 1. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pronouns TEXT DEFAULT 'Elle / He',
  avatar TEXT,
  pin TEXT UNIQUE NOT NULL,
  cedula_hash TEXT NOT NULL,
  referred_by_pin TEXT,
  referred_by_name TEXT,
  status TEXT DEFAULT 'disponible',
  personal_message TEXT DEFAULT 'Construyendo espacios seguros 🌈✨',
  current_song TEXT,
  allow_whatsapp_bridge BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  invitations_remaining INT DEFAULT 3,
  reputation_score INT DEFAULT 100,
  radar_visible BOOLEAN DEFAULT false,
  city TEXT DEFAULT 'Barquisimeto',
  is_enabled BOOLEAN DEFAULT true,
  security_question_1 TEXT,
  security_answer_1_hash TEXT,
  security_question_2 TEXT,
  security_answer_2_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Comunidades
CREATE TABLE IF NOT EXISTS public.communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  is_closed BOOLEAN DEFAULT false,
  pin_code TEXT,
  icon TEXT DEFAULT '🫧',
  creator_id TEXT,
  is_frozen BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Miembros de Comunidades
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id TEXT REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  user_pin TEXT NOT NULL,
  role TEXT DEFAULT 'participante',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Mensajes de Chat (Salas de Comunidad y Directos)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  sender_pronouns TEXT,
  text TEXT NOT NULL,
  is_zump BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  audio_url TEXT,
  audio_duration_seconds INT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Solicitudes de Conectar Burbujas 🫧
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  from_user_name TEXT NOT NULL,
  from_user_avatar TEXT,
  from_user_pronouns TEXT,
  from_user_pin TEXT NOT NULL,
  to_user_pin TEXT NOT NULL,
  intro_message TEXT,
  distance_km NUMERIC,
  city TEXT,
  song TEXT,
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla de Denuncias y Seguridad
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  reported_user_id TEXT NOT NULL,
  reported_user_name TEXT NOT NULL,
  reported_user_avatar TEXT,
  reported_user_pin TEXT NOT NULL,
  inviter_pin TEXT,
  inviter_name TEXT,
  reason TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT DEFAULT 'pendiente',
  inviter_alerted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- HABILITAR REALTIME EN CHAT Y SOLICITUDES
-- ================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ================================================================
-- INSERTAR COMUNIDAD PRINCIPAL POR DEFECTO
-- ================================================================
INSERT INTO public.communities (id, name, description, category, icon, is_closed)
VALUES 
  ('comm-bqto', 'Gays Barquisimeto & Lara', 'Comunidad local para encuentros seguros, planes culturales en Barquisimeto, rutas de café y apoyo en el estado Lara.', 'Encuentros & Cultura', '🌆', false),
  ('comm-trans', 'Espacio Seguro & Acompañamiento Trans', 'Sala de apoyo mutuo, experiencias de transición, consejos de salud comunitaria y escucha empática.', 'Apoyo & Cuidados', '🏳️‍⚧️', true)
ON CONFLICT (id) DO NOTHING;
