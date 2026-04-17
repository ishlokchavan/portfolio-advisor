-- Portfolio Advisor database schema
-- Run this in Supabase SQL Editor before using the app.

create extension if not exists "uuid-ossp";

-- Tables
create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  project_name text not null,
  developer text,
  unit_number text,
  purchase_price numeric not null default 0,
  payment_plan_type text,
  expected_handover date,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

create table if not exists property_owners (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  ownership_percentage numeric not null default 100,
  role text default 'owner',
  created_at timestamptz default now(),
  unique(property_id, user_id)
);

create table if not exists payment_schedules (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  milestone text not null,
  due_date date not null,
  amount numeric not null default 0,
  status text default 'upcoming' check (status in ('paid','upcoming','overdue')),
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_property_owners_user on property_owners(user_id);
create index if not exists idx_payment_schedules_property on payment_schedules(property_id);
create index if not exists idx_payment_schedules_due on payment_schedules(due_date);

-- RLS
alter table properties enable row level security;
alter table property_owners enable row level security;
alter table payment_schedules enable row level security;

-- Helper function (avoids recursion in RLS)
create or replace function is_owner(p_id uuid) returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from property_owners
    where property_id = p_id and user_id = auth.uid()
  );
$$;

-- Properties policies
drop policy if exists "view own properties" on properties;
create policy "view own properties" on properties for select
  using (is_owner(id));

drop policy if exists "insert properties" on properties;
create policy "insert properties" on properties for insert
  with check (auth.uid() = created_by);

drop policy if exists "update own properties" on properties;
create policy "update own properties" on properties for update
  using (is_owner(id));

drop policy if exists "delete by creator" on properties;
create policy "delete by creator" on properties for delete
  using (auth.uid() = created_by);

-- Property owners policies
drop policy if exists "view owners of my properties" on property_owners;
create policy "view owners of my properties" on property_owners for select
  using (is_owner(property_id));

drop policy if exists "only creator manages owners" on property_owners;
create policy "only creator manages owners" on property_owners for insert
  with check (
    exists (select 1 from properties where id = property_id and created_by = auth.uid())
  );

drop policy if exists "creator updates owners" on property_owners;
create policy "creator updates owners" on property_owners for update
  using (
    exists (select 1 from properties where id = property_id and created_by = auth.uid())
  );

drop policy if exists "creator deletes owners" on property_owners;
create policy "creator deletes owners" on property_owners for delete
  using (
    exists (select 1 from properties where id = property_id and created_by = auth.uid())
  );

-- Payment schedules policies
drop policy if exists "view payments" on payment_schedules;
create policy "view payments" on payment_schedules for select
  using (is_owner(property_id));

drop policy if exists "insert payments" on payment_schedules;
create policy "insert payments" on payment_schedules for insert
  with check (is_owner(property_id));

drop policy if exists "update payments" on payment_schedules;
create policy "update payments" on payment_schedules for update
  using (is_owner(property_id));

drop policy if exists "delete payments" on payment_schedules;
create policy "delete payments" on payment_schedules for delete
  using (is_owner(property_id));

-- Trigger: auto-add creator as 100% owner
create or replace function add_creator_as_owner() returns trigger
language plpgsql security definer as $$
begin
  insert into property_owners (property_id, user_id, ownership_percentage, role)
  values (new.id, new.created_by, 100, 'creator');
  return new;
end;
$$;

drop trigger if exists trg_add_creator_owner on properties;
create trigger trg_add_creator_owner
  after insert on properties
  for each row execute function add_creator_as_owner();
