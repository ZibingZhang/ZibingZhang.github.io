---
title: "TV Shows"
permalink: /personal/entertainment/tv-shows/
layout: single
sidebar:
  title: "Entertainment"
  nav: entertainment
toc: true
classes: wide
shows:
  to_watch:
    - The Boys
    - Dark
    - Dark Matter
    - His Dark Materials
    - Shadow and Bones
    - The Stranger
    - Sweet Tooth
    - The Umbrella Academy
  watched:
    - The 100|season 7
    - 13 Reasons Why|season 1, in progress
    - 3%|season 1
    - Altered Carbon|season 2
    - Another Life|season 1
    - Arrow|season 1, in progress
    - Avatar the Last Airbender|season 1 episode 10
    - Black Mirror|in progress
    - Bodyguard|season 1
    - Breaking Bad|in progress
    - The Blacklist|season 1 episode 13
    - Bones|in progress
    - Chernobyl|season 1
    - Criminal Minds|in progress
    - Crisis|season 1
    - Counterpart|season 2
    - Designated Survivor|season 3
    - Doctor Who|season 8 episode 11
    - The Expanse|season 6
    - Fringe|in progress
    - Game of Thrones|season 8
    - Gossip Girl|season 2, in progress
    - Hanna|season 2
    - The Haunting of Hill House|season 1
    - Lost|in progress
    - Lupin|in progress
    - The Mandalorian|season 2
    - Money Heist|part 4
    - Narcos|season 3
    - The Office|season 5 episode 21
    - The Outsider|season 1
    - Prison Break|season 2, in progress
    - The Queen's Gambit|season 1
    - Revolution|season 2
    - Sherlock Holmes|series 4
    - Silicone Valley|season 1, in progress
    - Stranger Things|season 3
    - Suits|season 4, in progress
    - The Undoing|season 1
    - The Walking Dead|in progress
    - Westworld|season 1
    - The Witcher|season 1
---

A list of shows that I've either watched or are in the middle of watching.
Next to each show is an indication of how many episodes I've watched.
No episode number indicates that I've watched the entire season.
The phrase *in progress* indicates that I've either forgotten how far into the show I am,
or I am watching the episodes out of order (as is the case for Black Mirror).

**2020-09-20** Started the list.

## To Watch
<ul>
  {%- for show in page.shows.to_watch -%}
    <li>
      <b>{{ show }}</b>
    </li>
  {%- endfor -%}
</ul>

## Currently Watching / Have Watched

<ul>
  {%- for show in page.shows.watched -%}
    {% assign show_data = show | split: '|' %}
    <li>
      <b>{{ show_data[0] }}</b>&nbsp;–&nbsp;(<i>{{ show_data[1] }}</i>)
    </li>
  {%- endfor -%}
</ul>
