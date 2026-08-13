# Supabase setup for CGPSC resources

Run this in Supabase SQL Editor. It creates the table, lets everyone read resources, and allows only the named administrator to add/delete them.

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
create policy "Only admin can add CGPSC resources" on public.cgpsc_resources for insert to authenticated with check ((auth.jwt() ->> 'email') = '4k4sh07@gmail.com');
create policy "Only admin can delete CGPSC resources" on public.cgpsc_resources for delete to authenticated using ((auth.jwt() ->> 'email') = '4k4sh07@gmail.com');
```

## Vercel deployment

Import this GitHub repository into Vercel with the default settings. It is a static HTML site: no build command or environment variable is needed.

After Vercel gives you the production URL, add this exact URL to **Supabase → Authentication → URL Configuration → Redirect URLs**, with `/login.html` at the end. Example: `https://your-project.vercel.app/login.html`.

The password-reset link automatically uses the domain it was requested from, so it works from both GitHub Pages and Vercel once that redirect URL is allow-listed.
