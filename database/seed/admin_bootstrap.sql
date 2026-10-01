-- =============================================================================
-- Marga Mulya Hub — admin_bootstrap.sql  (template, design D7)
--
-- Promotes an existing Supabase Auth user to admin.
--   1. Supabase Dashboard → Authentication → Sign In / Providers:
--      turn OFF "Allow new users to sign up".
--   2. Authentication → Users → Add user (email + password, "Auto Confirm").
--   3. Replace admin@example.com below with that email and run this in the SQL editor.
-- Passwords are handled only by Supabase Auth; nothing is stored here.
-- =============================================================================

insert into public.admin_users (id, email, full_name)
select id, email, 'Administrator Desa' from auth.users where email = 'admin@example.com'
on conflict (id) do nothing;
