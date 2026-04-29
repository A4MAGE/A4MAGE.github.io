create table broadcast_room (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null,
  title text not null check (char_length(btrim(title)) > 0),
  current_preset_id bigint,
  current_preset_data json,
  current_audio_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint broadcast_room_host_fkey foreign key (host_user_id) references auth.users (id) on update cascade on delete cascade,
  constraint broadcast_room_preset_fkey foreign key (current_preset_id) references preset (id) on update cascade on delete set null
);

alter table broadcast_room enable row level security;

-- Any authenticated user can read active rooms
create policy "Authenticated users can read active rooms" on broadcast_room
  for select using (auth.uid() is not null and is_active = true);

-- A host can also read their own inactive rooms (so they can check status after stopping)
create policy "Host can read own rooms" on broadcast_room
  for select using (auth.uid() = host_user_id);

-- Only the host can insert their own room
create policy "Host can insert own room" on broadcast_room
  for insert with check (auth.uid() = host_user_id);

-- Only the host can update their own room
create policy "Host can update own room" on broadcast_room
  for update using (auth.uid() = host_user_id);

-- Only the host can delete their own room
create policy "Host can delete own room" on broadcast_room
  for delete using (auth.uid() = host_user_id);

-- Enable Supabase Realtime replication for this table
alter publication supabase_realtime add table broadcast_room;
