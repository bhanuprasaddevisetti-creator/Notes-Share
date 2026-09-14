-- Run this whole file once in your Supabase project's SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  domain text, -- e.g. 'nitw.ac.in'. Null until the first student sets it.
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  college_id uuid references colleges(id),
  year text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid references profiles(id) on delete set null,
  college_id uuid references colleges(id) not null,
  year text not null,
  subject text not null,
  title text not null,
  description text,
  file_path text not null,
  score integer default 0,
  created_at timestamptz default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz default now(),
  unique (note_id, user_id)
);

-- ============================================================
-- TRIGGER: auto-create a profile row whenever someone signs up.
-- Reads the metadata passed in supabase.auth.signUp({ options: { data } })
-- from the client, so the profile is complete even before the user
-- confirms their email.
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, college_id, year, verified)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    (new.raw_user_meta_data ->> 'college_id')::uuid,
    new.raw_user_meta_data ->> 'year',
    coalesce((new.raw_user_meta_data ->> 'verified')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- TRIGGER: keep notes.score in sync with the votes table.
-- ============================================================

create or replace function update_note_score()
returns trigger as $$
declare
  affected_note uuid;
begin
  affected_note := coalesce(new.note_id, old.note_id);
  update notes
    set score = (select coalesce(sum(value), 0) from votes where note_id = affected_note)
    where id = affected_note;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_vote_change on votes;
create trigger on_vote_change
  after insert or update or delete on votes
  for each row execute procedure update_note_score();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table colleges enable row level security;
alter table profiles enable row level security;
alter table notes enable row level security;
alter table votes enable row level security;

-- Colleges: anyone can view; the signup flow (before login) needs to be
-- able to add a new college, so inserts are open too — it's just a name.
create policy "colleges are viewable by everyone" on colleges
  for select using (true);
create policy "anyone can add a college" on colleges
  for insert with check (true);

-- Profiles: any signed-in user can see basic profile info (needed to show
-- "uploaded by ___" and verified badges). Users can only edit their own row.
create policy "profiles are viewable by authenticated users" on profiles
  for select using (auth.role() = 'authenticated');
create policy "users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Notes: viewable and postable by signed-in users only.
create policy "notes are viewable by authenticated users" on notes
  for select using (auth.role() = 'authenticated');
create policy "users can upload notes" on notes
  for insert with check (auth.uid() = uploader_id);
create policy "uploaders can delete their own notes" on notes
  for delete using (auth.uid() = uploader_id);

-- Votes: signed-in users manage their own votes only.
create policy "users can view their own votes" on votes
  for select using (auth.uid() = user_id);
create policy "users can cast votes" on votes
  for insert with check (auth.uid() = user_id);
create policy "users can change their own vote" on votes
  for update using (auth.uid() = user_id);
create policy "users can remove their own vote" on votes
  for delete using (auth.uid() = user_id);

-- ============================================================
-- STORAGE: bucket for uploaded note files.
-- Files are readable by anyone with the link, uploadable by signed-in users.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('notes-files', 'notes-files', true)
on conflict (id) do nothing;

create policy "note files are publicly readable" on storage.objects
  for select using (bucket_id = 'notes-files');
create policy "authenticated users can upload note files" on storage.objects
  for insert with check (bucket_id = 'notes-files' and auth.role() = 'authenticated');
