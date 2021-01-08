---
title: "Books"
permalink: /personal/entertainment/books/
layout: single
sidebar:
  title: "Entertainment"
  nav: entertainment
toc: true
classes: wide
books:
  to_read:
    - Altered Carbon|Richard Morgan
    - The Hitchhiker's Guide to the Galexy|Douglas Adam
    - Ball Lightning|Liu Cixin
    - The Martian|Andy Weir
    - The Fire Within|Chris d'Lacey
    - All The Light We Cannot See|Anthony Doerr
    - Ishmael|Daniel Quinn
    - Brave New World|Aldous Huxley
    - The Forever War|Joe Haldeman
  finished_reading:
    - Dawnshard|Brandon Sanderson|2021-01-06
    - Edgedancer|Brandon Sanderson|2021-01-05
    - Oathbringer|Brandon Sanderson|2021-01-04
    - Words of Radiance|Brandon Sanderson|2020-12-25
    - The Way of Kings|Brandon Sanderson|2020-12-20
    - The Wise Man's Fear|Patrick Rothfuss|2020-10-12
    - The Name of the Wind|Patrick Rothfuss|2020-10-07
    - Stories of Your Life and Others|Ted Chiang|2020-09-20
series:
  to_read:
    - Broken Earth Trilogy|Nora Jemisin
    - The Expanse|James Corey
    - Foundation|Issac Asimov
    - Gentleman Bastard|Scott Lynch
    - Mistborn|Brandon Sanderson
    - The Wheel of Time|Robert Jordan
---

A list of books that I've read and a list of them that I've been meaning to read.
This list includes only the books I've finished since I've started the list.

**2020-09-20** Started the list.

## To Read
<ul>
  {%- for book in page.books.to_read -%}
    {% assign book_data = book | split: '|' %}
    <li><b>{{ book_data[0] }}</b> by {{ book_data[1] }}</li>
  {%- endfor -%}
</ul><ul>
  {%- for series in page.series.to_read -%}
    {% assign series_data = series | split: '|' %}
    <li><b>{{ series_data[0] }}</b> by {{ series_data[1] }}</li>
  {%- endfor -%}
</ul>

## Finished Reading
<ul>
  {%- for book in page.books.finished_reading -%}
    {% assign book_data = book | split: '|' %}
    <li><s><b>{{ book_data[0] }}</b> by {{ book_data[1] }}</s> ({{ book_data[2] }})</li>
  {%- endfor -%}
</ul>
