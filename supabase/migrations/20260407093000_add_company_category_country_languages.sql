alter table public.company
add column if not exists category text not null default '',
add column if not exists country text not null default 'Worldwide',
add column if not exists languages text[] not null default array['English']::text[];

update public.company
set
  category = coalesce(nullif(category, ''), nullif(description, ''), ''),
  country = coalesce(nullif(country, ''), 'Worldwide'),
  languages = case
    when languages is null or array_length(languages, 1) is null then array['English']::text[]
    else languages
  end;
