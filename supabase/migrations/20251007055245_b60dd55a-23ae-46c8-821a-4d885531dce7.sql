-- Drop the duplicate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();