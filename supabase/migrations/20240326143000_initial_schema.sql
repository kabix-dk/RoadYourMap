-- Migration: Initial Schema Creation
-- Description: Creates the initial database schema for RoadYourMap application
-- Tables: roadmaps, roadmap_items
-- Author: System
-- Date: 2024-03-26

-- Create roadmaps table
create table roadmaps (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    title text not null,
    experience_level text not null,
    technology text not null,
    goals text not null,
    additional_info text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create roadmap_items table with self-referential relationship
create table roadmap_items (
    id uuid primary key default gen_random_uuid(),
    roadmap_id uuid not null references roadmaps(id) on delete cascade,
    parent_item_id uuid references roadmap_items(id) on delete cascade,
    title text not null,
    description text,
    level int not null,
    position int not null,
    is_completed boolean not null default false,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- Ensure unique position within same parent and roadmap
    constraint unique_position_per_parent unique (roadmap_id, parent_item_id, position)
);

-- Create performance indexes
create index idx_roadmaps_user_id on roadmaps(user_id);
create index idx_items_roadmap_parent_position on roadmap_items(roadmap_id, parent_item_id, position);

-- Enable Row Level Security (RLS)
alter table roadmaps enable row level security;
alter table roadmap_items enable row level security;

-- RLS Policies for roadmaps

-- Policy: Allow users to select their own roadmaps
create policy "Users can view their own roadmaps"
    on roadmaps
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy: Allow users to insert their own roadmaps
create policy "Users can create their own roadmaps"
    on roadmaps
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy: Allow users to update their own roadmaps
create policy "Users can update their own roadmaps"
    on roadmaps
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy: Allow users to delete their own roadmaps
create policy "Users can delete their own roadmaps"
    on roadmaps
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- RLS Policies for roadmap_items

-- Policy: Allow users to select items from their roadmaps
create policy "Users can view items from their roadmaps"
    on roadmap_items
    for select
    to authenticated
    using (
        exists (
            select 1 from roadmaps
            where id = roadmap_items.roadmap_id
            and user_id = auth.uid()
        )
    );

-- Policy: Allow users to insert items into their roadmaps
create policy "Users can create items in their roadmaps"
    on roadmap_items
    for insert
    to authenticated
    with check (
        exists (
            select 1 from roadmaps
            where id = roadmap_items.roadmap_id
            and user_id = auth.uid()
        )
    );

-- Policy: Allow users to update items in their roadmaps
create policy "Users can update items in their roadmaps"
    on roadmap_items
    for update
    to authenticated
    using (
        exists (
            select 1 from roadmaps
            where id = roadmap_items.roadmap_id
            and user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from roadmaps
            where id = roadmap_items.roadmap_id
            and user_id = auth.uid()
        )
    );

-- Policy: Allow users to delete items from their roadmaps
create policy "Users can delete items from their roadmaps"
    on roadmap_items
    for delete
    to authenticated
    using (
        exists (
            select 1 from roadmaps
            where id = roadmap_items.roadmap_id
            and user_id = auth.uid()
        )
    );

-- Create function to enforce maximum roadmaps per user
create or replace function enforce_max_roadmaps_per_user()
returns trigger as $$
begin
    if (select count(*) from roadmaps where user_id = new.user_id) > 5 then
        raise exception 'User % may not have more than 5 roadmaps', new.user_id;
    end if;
    return new;
end;
$$ language plpgsql;

-- Create trigger for maximum roadmaps enforcement
create trigger trg_max_roadmaps
    before insert or update on roadmaps
    for each row execute function enforce_max_roadmaps_per_user(); 