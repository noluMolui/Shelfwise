revoke insert, update, delete on public.businesses, public.user_profiles
  from authenticated;

grant update (name) on public.businesses to authenticated;
grant update (full_name) on public.user_profiles to authenticated;

create policy "Users can update their own profile name"
on public.user_profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
