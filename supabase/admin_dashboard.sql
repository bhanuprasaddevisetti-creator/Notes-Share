-- Run this AFTER schema.sql, in the same SQL Editor.
-- Adds an admin flag to profiles, and a function that returns usage stats --
-- member counts, verified/unverified split, and storage used -- but only to
-- accounts flagged as admin.

alter table profiles add column if not exists is_admin boolean default false;

create or replace function get_admin_stats()
returns json as $$
declare
  caller_is_admin boolean;
  result json;
begin
  select is_admin into caller_is_admin from profiles where id = auth.uid();
  if not coalesce(caller_is_admin, false) then
    raise exception 'not authorized';
  end if;

  select json_build_object(
    'total_users', (select count(*) from profiles),
    'verified_users', (select count(*) from profiles where verified = true),
    'unverified_users', (select count(*) from profiles where coalesce(verified, false) = false),
    'total_notes', (select count(*) from notes),
    'total_colleges', (select count(*) from colleges),
    'storage_bytes', (
      select coalesce(sum((metadata ->> 'size')::bigint), 0)
      from storage.objects
      where bucket_id = 'notes-files'
    ),
    'users_by_college', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select c.name as college_name, count(p.id) as user_count
        from colleges c
        left join profiles p on p.college_id = c.id
        group by c.name
        order by user_count desc
      ) t
    )
  ) into result;

  return result;
end;
$$ language plpgsql security definer;

-- Finally, make YOUR account an admin. Replace the email below with the one
-- you signed up with, then run just this line:
-- update profiles set is_admin = true where id = (select id from auth.users where email = 'you@yourcollege.ac.in');
