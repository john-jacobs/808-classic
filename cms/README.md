# Legacy Google Sheets Migration Reference

The visible site now loads its configuration from Supabase through
`/api/tournament`. This document records the original Google Sheet structure for
migration and audit purposes only.

## Setup

Do not use the Sheet as the production CMS. Future content editing will happen
inside Tournament Central.

## `people`

One row per person. Add rows freely.

```text
id
name
title
city
height
handicap
odds
classic_record
quote
blurb
strength
weakness
headshot
action_photo
person_type
sort_order
active
```

Suggested `person_type` values:

```text
current_player
past_player
alumni
guest
family
```

## `classic_attendance`

One row per person per Classic year. This decides who appears in the current field versus alumni.

```text
year
person_id
status
rank
score
arrival
departure
odds
handicap
classic_record
notes
sort_order
active
```

Use `status = player` for the current field. Use `status = past_player` for prior-year player records. Do not use a host field.

## `site_copy`

Longer-form editable copy. Use blank lines inside `body` to create multiple paragraphs.

```text
key
title
body
active
```

Supported keys today:

```text
about
history
```

## `lodging`

```text
name
address
image
detail
airbnb_url
map_url
check_in
check_out
beds
total
per_person
transit
active
```

## `courses`

```text
day
name
status
tee_times
phone
address
image
blurb
site_url
map_url
sort_order
active
```

## `events`

```text
date
title
time
place
address
blurb
link
link_label
sort_order
active
```

## `guests`

```text
name
role
image
image_fit
detail
sort_order
active
```
