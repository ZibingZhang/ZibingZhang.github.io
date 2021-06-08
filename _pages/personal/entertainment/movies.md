---
title: "Movies"
permalink: /personal/entertainment/movies/
layout: single
sidebar:
  title: "Entertainment"
  nav: entertainment
toc: true
classes: wide
movies:
  have_watched:
    - A Silent Voice|2021-06-04
    - What Happened to Monday|2021-05-27
    - The White Tiger|2021-05-26
    - Outsourced|2021-05-24
    - Tenet|2021-05-15
    - Minari|2021-05-09
    - The Princess Bride|2021-04-28
    - Friends With Benefits|2021-04-XX
    - The Perks of Being a Wallflower|2021-03-31
    - The Perks of Being a Wallflower|2021-03-28
    - Okja|2021-03-26
    - Train To Busan|2021-01-12
    - Shoplifters|2020-12-30
  to_watch:
    - Black Swan
    - Children of Men
    - Dark Waters
    - The Dawn Wall (d)
    - "Fantastic Beasts: The Crimes of Grindelwald"
    - Goodbye Christopher Robin
    - Official Secrets
    - The Professor and the Madman
---

A list of movies that I've watched and a list of them that I've been meaning to watch.
Documentaries are included but will be labeled with a `(d)`.
Movies with common names may be succeeded with the year it was released.

**2020-12-30** Started the list.

## To Watch
<ul>
  {%- for movie in page.movies.to_watch -%}
    <li><b>{{ movie }}</b></li>
  {%- endfor -%}
</ul>

## Have Watched
<ul>
  {%- for movie in page.movies.have_watched -%}
    {% assign movie_data = movie | split: '|' %}
    <li><s><b>{{ movie_data[0] }}</b></s> ({{ movie_data[1] }})</li>
  {%- endfor -%}
</ul>
