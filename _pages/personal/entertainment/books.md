---
title: "Books"
permalink: /personal/entertainment/books/
layout: single
sidebar:
  title: "Entertainment"
  nav: entertainment
toc: true
classes: wide
to_read:
  books:
    - All The Light We Cannot See|Anthony Doerr
    - Altered Carbon|Richard Morgan
    - Ball Lightning|Liu Cixin
    - Brave New World|Aldous Huxley
    - The Forever War|Joe Haldeman
    - The Hitchhiker's Guide to the Galexy|Douglas Adam
    - Ishmael|Daniel Quinn
    - The Martian|Andy Weir
    - The Wandering Earth|Liu Cixin
  series:
    - Broken Earth Trilogy|Nora Jemisin
    - A Court of Thorns and Roses|Sarah Maas
    - The Dandelion Dynasty|Ken Liu
    - Dune|Frank Herbert
    - The Expanse|James Corey
    - Foundation|Issac Asimov
    - Gentleman Bastard|Scott Lynch
    - Malazan Book of the Fallen|Steven Erikson
finished_reading:
  - The Three-Body Problem|Liu Cixin|2021-06-02
  - The Eye of the World|Robert Jordan|2021-05-31
  - "Arcanum Unbounded: The Cosmere Collection|Brandon Sanderson|2021-05-10"
  - The Bands of Mourning|Brandon Sanderson|2021-05-06
  - Warbreaker|Brandon Sanderson|2021-04-20
  - Elantris|Brandon Sanderson|2021-04-13
  - Shadows of Self|Brandon Sanderson|2021-04-09
  - The Alloy of Law|Brandon Sanderson|2021-03-17
  - The Hero of Ages|Brandon Sanderson|2021-03-12
  - The Well of Ascension|Brandon Sanderson|2021-03-08
  - The Final Empire|Brandon Sanderson|2021-02-28
  - Rhythm of War|Brandon Sanderson|2021-01-17
  - Dawnshard|Brandon Sanderson|2021-01-06
  - Edgedancer|Brandon Sanderson|2021-01-05
  - Oathbringer|Brandon Sanderson|2021-01-04
  - Words of Radiance|Brandon Sanderson|2020-12-25
  - The Way of Kings|Brandon Sanderson|2020-12-20
  - The Wise Man's Fear|Patrick Rothfuss|2020-10-12
  - The Name of the Wind|Patrick Rothfuss|2020-10-07
  - Stories of Your Life and Others|Ted Chiang|2020-09-20
---

A list of books that I've read and a list of them that I've been meaning to read.
This list includes only the books I've finished since I've started the list.

**2020-09-20** Started the list.

## To Read
<div>
  {%- for section in page.to_read -%}
    <ul>
      {%- for book in section[1] -%}
        {% assign book_data = book | split: '|' %}
        <li><b>{{ book_data[0] }}</b> by {{ book_data[1] }}</li>
      {%- endfor -%}
    </ul>
  {%- endfor -%}
</div>

## Finished Reading
<ul>
  {%- for book in page.finished_reading -%}
    {% assign book_data = book | split: '|' %}
    <li><s><b>{{ book_data[0] }}</b> by {{ book_data[1] }}</s> ({{ book_data[2] }})</li>
  {%- endfor -%}
</ul>
