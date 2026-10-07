-- Phase-1 target schema for Supabase/PostgreSQL.
-- This is a migration target, NOT the active SQLite runtime adapter.
-- All currency columns store integer euro cents. All monetary writes require
-- a server transaction (service role); authenticated clients have read access only.
create extension if not exists pgcrypto;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check(username ~ '^[A-Za-z0-9_]{3,20}$'),
 xp bigint not null default 0 check(xp>=0),
 earned bigint not null default 0 check(earned>=0),
 passive_earned bigint not null default 0 check(passive_earned>=0),
 jobs_done integer not null default 0 check(jobs_done>=0),
 play_seconds bigint not null default 0,
 last_settled timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create unique index username_case_insensitive on public.profiles(lower(username));
create table public.wallets (
 player_id uuid primary key references public.profiles(id) on delete cascade,
 cash bigint not null default 10000 check(cash>=0),
 bank bigint not null default 0 check(bank>=0),
 version bigint not null default 0
);
create table public.jobs (
 id text primary key, name text not null, category text not null,
 pay bigint not null check(pay>0), xp integer not null check(xp>0),
 seconds integer not null check(seconds>0), required_level integer not null default 1,
 prompt text not null, choices jsonb not null, answer integer not null check(answer between 0 and 2)
);
create table public.player_jobs (
 id uuid primary key default gen_random_uuid(),player_id uuid not null references public.profiles(id) on delete cascade,
 job_id text not null references public.jobs(id), started_at timestamptz not null default now(),
 completed_at timestamptz, reward bigint check(reward>=0), choice integer check(choice between 0 and 2)
);
create unique index one_active_job on public.player_jobs(player_id) where completed_at is null;
create index player_job_history on public.player_jobs(player_id,started_at desc);
create table public.industries (
 id text primary key,name text not null,icon text not null,
 founding_cost bigint not null check(founding_cost>0),
 base_revenue bigint not null check(base_revenue>0),base_costs bigint not null check(base_costs>=0)
);
create table public.companies (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.profiles(id) on delete cascade,
 industry_id text not null references public.industries(id),name text not null check(length(name) between 3 and 32),
 cash bigint not null default 0,created_at timestamptz not null default now()
);
create index company_owner on public.companies(owner_id);
create table public.upgrades (
 id text primary key,name text not null,type text not null,price bigint not null check(price>0),
 boost numeric(5,3) not null check(boost>0)
);
create table public.company_upgrades (
 company_id uuid not null references public.companies(id) on delete cascade,
 upgrade_id text not null references public.upgrades(id),purchased_at timestamptz not null default now(),
 primary key(company_id,upgrade_id)
);
create table public.employee_candidates (
 id text primary key,name text not null,role text not null,skill integer not null check(skill between 0 and 100),
 salary bigint not null check(salary>0),hire_cost bigint not null check(hire_cost>0),boost numeric(5,3) not null
);
create table public.company_employees (
 company_id uuid not null references public.companies(id) on delete cascade,
 candidate_id text not null references public.employee_candidates(id), hired_at timestamptz not null default now(),
 primary key(company_id,candidate_id)
);
create table public.company_finances (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,
 period_start timestamptz not null,period_end timestamptz not null,
 revenue bigint not null,costs bigint not null,profit bigint generated always as(revenue-costs) stored
);
create index finances_company_period on public.company_finances(company_id,period_end desc);
create table public.items (
 id text primary key,name text not null,brand text not null,
 slot text not null check(slot in ('top','pants','shoes','hat','accessory')),
 color text not null,price bigint not null check(price>0),aura integer not null check(aura>=0),
 rarity text not null check(rarity in ('Common','Rare','Legendary'))
);
create table public.player_inventory (
 id uuid primary key default gen_random_uuid(),player_id uuid not null references public.profiles(id) on delete cascade,
 item_id text not null references public.items(id),acquired_at timestamptz not null default now(),
 unique(player_id,item_id),unique(id,player_id)
);
create index inventory_player on public.player_inventory(player_id);
create table public.outfits (
 player_id uuid not null references public.profiles(id) on delete cascade,
 slot text not null check(slot in ('top','pants','shoes','hat','accessory')),
 inventory_id uuid not null,
 primary key(player_id,slot),
 foreign key(inventory_id,player_id) references public.player_inventory(id,player_id) on delete cascade
);
create table public.achievements (
 id text primary key,name text not null,description text not null,target bigint not null
);
create table public.player_achievements (
 player_id uuid not null references public.profiles(id) on delete cascade,
 achievement_id text not null references public.achievements(id),unlocked_at timestamptz not null default now(),
 primary key(player_id,achievement_id)
);
create table public.transactions (
 id uuid primary key default gen_random_uuid(),player_id uuid not null references public.profiles(id) on delete cascade,
 company_id uuid references public.companies(id) on delete set null,
 reason text not null,amount bigint not null,
 idempotency_key uuid unique,created_at timestamptz not null default now()
);
create index transaction_player_time on public.transactions(player_id,created_at desc);
create table public.action_limits (
 player_id uuid primary key references public.profiles(id) on delete cascade,last_action timestamptz not null
);
-- Public profile details stay separate from private financial records.
-- Leaderboard stats are derived by a server view/job, never accepted from clients.
create table public.leaderboard_stats (
 player_id uuid primary key references public.profiles(id) on delete cascade,
 net_worth bigint not null default 10000,aura integer not null default 0,
 level integer not null default 1,company_value bigint not null default 0,
 revenue bigint not null default 0,updated_at timestamptz not null default now()
);
create index leaderboard_wealth on public.leaderboard_stats(net_worth desc);
create index leaderboard_aura on public.leaderboard_stats(aura desc);
-- Enable RLS on every table. No insert/update/delete policies: only the
-- trusted backend may perform economy mutations, inside database transactions.
do $$ declare t text; begin
 foreach t in array array['profiles','wallets','jobs','player_jobs','industries','companies','upgrades','company_upgrades','employee_candidates','company_employees','company_finances','items','player_inventory','outfits','achievements','player_achievements','transactions','action_limits','leaderboard_stats'] loop
 execute format('alter table public.%I enable row level security',t);
 end loop;
end $$;
create policy profile_read on public.profiles for select using(true);
create policy company_read on public.companies for select using(owner_id=auth.uid());
create policy wallet_read on public.wallets for select using(player_id=auth.uid());
create policy jobs_read on public.jobs for select using(true);
create policy player_jobs_read on public.player_jobs for select using(player_id=auth.uid());
create policy industries_read on public.industries for select using(true);
create policy upgrades_read on public.upgrades for select using(true);
create policy candidates_read on public.employee_candidates for select using(true);
create policy items_read on public.items for select using(true);
create policy achievements_read on public.achievements for select using(true);
create policy inventory_read on public.player_inventory for select using(player_id=auth.uid());
create policy outfit_read on public.outfits for select using(true);
create policy achievement_read on public.player_achievements for select using(true);
create policy transaction_read on public.transactions for select using(player_id=auth.uid());
create policy leaderboard_read on public.leaderboard_stats for select using(true);
create policy company_upgrades_read on public.company_upgrades for select using(exists(select 1 from public.companies c where c.id=company_id and c.owner_id=auth.uid()));
create policy company_employees_read on public.company_employees for select using(exists(select 1 from public.companies c where c.id=company_id and c.owner_id=auth.uid()));
create policy company_finances_read on public.company_finances for select using(exists(select 1 from public.companies c where c.id=company_id and c.owner_id=auth.uid()));
-- Keep jobs.answer server-only; authenticated users may select safe columns.
revoke select on public.jobs from anon,authenticated;
grant select(id,name,category,pay,xp,seconds,required_level,prompt,choices) on public.jobs to anon,authenticated;
-- Atomic purchase template for a future Supabase runtime.
create function public.buy_item(p_item_id text,p_request_id uuid) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_player uuid:=auth.uid();v_price bigint;v_owned uuid;begin
 if v_player is null then raise exception 'authentication required'; end if;
 perform 1 from public.wallets where player_id=v_player for update;
 if exists(select 1 from public.transactions where idempotency_key=p_request_id) then raise exception 'duplicate request'; end if;
 select price into v_price from public.items where id=p_item_id;
 if v_price is null then raise exception 'unknown item'; end if;
 update public.wallets set cash=cash-v_price,version=version+1 where player_id=v_player and cash>=v_price;
 if not found then raise exception 'insufficient funds'; end if;
 insert into public.player_inventory(player_id,item_id) values(v_player,p_item_id) returning id into v_owned;
 insert into public.transactions(player_id,reason,amount,idempotency_key) values(v_player,'item purchase:'||p_item_id,-v_price,p_request_id);
 return v_owned;
end $$;
revoke all on function public.buy_item(text,uuid) from public,anon,authenticated;
-- Intentionally not exposed yet. The Supabase adapter must wire Auth, request
-- idempotency, limits, and every other economy action before switching runtime.
