---
title: "Animes"
permalink: /personal/entertainment/animes/
layout: single
sidebar:
  title: "Entertainment"
  nav: entertainment
classes: wide
animes:
  - "Violet Evergarden|2021-06-17|TBD"
  - "Fullmetal Alchemist: Brotherhood|2020-01-17|TBD"
---

A list of animes I've watched or are currently in the process of watching.

**2021-01-17** Started the list.

<ul>
  {%- for anime in page.animes -%}
    {% assign data = anime | split: '|' %}
    <li>
      <b>{{ data[0] }} </b><i>({{ data[1] }}/{{ data[2] }})</i>
    </li>
  {%- endfor -%}
</ul>
