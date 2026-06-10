alter table public.people
  add column handicap numeric(5,1),
  add column odds text,
  add column classic_record text;

update public.people
set
  handicap = v.handicap,
  odds = v.odds,
  classic_record = v.classic_record,
  updated_at = now()
from (values
  ('liam-hession',41.0,'+2500','1 appearance'),
  ('john-jacobs',15.3,'+225','1 appearance'),
  ('charles-vokes',24.2,'+500','2025 champion'),
  ('jake-dam',33.2,'+700','1 appearance'),
  ('arjun-nayini',40.0,'+4000','1 appearance'),
  ('evan-rodrigues',28.5,'+650','1 appearance'),
  ('david-weizeorick',26.0,'+1800','1 appearance'),
  ('bill-buchdal',6.0,null,'2025 field'),
  ('aaron-daroch',30.0,null,'2025 field'),
  ('hadrien-brisard',50.0,null,'2025 field'),
  ('arnaud-brisard',51.0,null,'2025 field')
) as v(slug, handicap, odds, classic_record)
where people.group_id = '80800000-0000-4000-8000-000000000001'
  and people.slug = v.slug;
