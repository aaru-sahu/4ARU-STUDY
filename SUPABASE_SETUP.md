# Supabase setup for CGPSC resources

Run this in Supabase SQL Editor. It creates the table, lets everyone read resources, and allows only signed-in users to add/delete them.

```sql
create table if not exists public.cgpsc_resources (
  id uuid primary key default gen_random_uuid(),
  icon text not null default '📘',
  title text not null,
  description text not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.cgpsc_resources enable row level security;
create policy "Public can read CGPSC resources" on public.cgpsc_resources for select using (true);
create policy "Signed-in users can add CGPSC resources" on public.cgpsc_resources for insert to authenticated with check (true);
create policy "Signed-in users can delete CGPSC resources" on public.cgpsc_resources for delete to authenticated using (true);
```

Before using the admin portal publicly, add proper admin authorization (for example, an `admins` table and an email allow-list) instead of allowing every authenticated user to write.
