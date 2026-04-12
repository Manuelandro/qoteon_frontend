do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'company'
      and column_name = 'country'
  ) then
    alter table public.company
    rename column country to region;
  end if;
end
$$;

alter table public.company
alter column region drop default;

alter table public.company
alter column region type text[]
using case
  when region is null or btrim(region) = '' then array['Worldwide']::text[]
  else array[region]::text[]
end;

update public.company
set region = array['Worldwide']::text[]
where region is null
   or array_length(region, 1) is null;

alter table public.company
alter column region set default array['Worldwide']::text[];
