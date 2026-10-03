-- GCat — konto użytkownika: profil, postęp lekcji, zadania, programy.
-- Uruchom w SQL Editor projektu Supabase (albo: supabase db push).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,                    -- np. frezowanie/F4.2
  visited bigint,                       -- ms od epoki (jak w przeglądarce)
  read boolean not null default false,
  quiz_score int,
  quiz_total int,
  quiz_at bigint,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table if not exists public.exercise_results (
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  passed boolean not null default true,
  at timestamptz not null default now(),
  primary key (user_id, slug)
);

create table if not exists public.programs (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,                     -- identyfikator zakładki z przeglądarki
  name text not null,
  src text not null,
  mode text not null check (mode in ('mill', 'lathe')),
  updated bigint not null,
  primary key (user_id, id)
);

-- profil zakładany automatycznie po rejestracji
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, split_part(coalesce(new.email, ''), '@', 1))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- każdy widzi i zmienia tylko swoje wiersze
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exercise_results enable row level security;
alter table public.programs enable row level security;

create policy "profil: własny" on public.profiles for select using (auth.uid() = id);
create policy "profil: zmiana nazwy" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and plan = (select plan from public.profiles where id = auth.uid()));

create policy "postęp: własny" on public.lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "zadania: własne" on public.exercise_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "programy: własne" on public.programs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
