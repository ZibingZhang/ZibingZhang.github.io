---
title: "Topology"
permalink: /personal/notes/northeastern/topology/
layout: latex
toc: true
classes: wide
---

## Chapter 0: Metric Spaces

We say $f$ is **continuous** at $x_0$ iff $\forall \varepsilon > 0, \exists \delta > 0, \lvert x - x_0 \rvert < \delta \implies \lvert f(x) - f(x_0) \rvert < \varepsilon$.
{: .notice--info}

This definition of continuity is provided by Cauchy in the 19<sup>th</sup> century in the context of functions.

We say $f$ is **continuous** on an interval $I$ iff $f$ is continuous at every point of $I$.
{: .notice--info}

A **normed vector space** $(E, \lVert\,.\rVert)$ is a pair consisting of a vector space $E$ and a norm $\lVert\,.\rVert:\,E \to \mathbb{R}_+$, i.e.
<br>
$i$ )&nbsp; if $x \in E$ such that $\lVert x \rVert = 0$, then $x = 0$
<br>
$ii$ )&nbsp; $\forall \lambda \in \mathbb{R}, \forall x \in E, \lVert \lambda x \rVert = \lvert \lambda \rvert \lVert x \rVert$
<br>
$iii$ )&nbsp; (*Triangle Inequality*) $\forall x, y \in E, \lVert x + y \rVert \leq \lVert x \rVert + \lVert y \rVert$
{: .notice--info}

Some examples of normed vector spaces include
1. $E = \mathbb{R}$, $\lVert\,.\rVert$ is the absolute value $\lvert\,.\rvert$
2. $E = \mathbb{R}^n$, $\lVert x \rVert_1      = \lvert x_1 \rvert + \cdots + \lvert x_n \rvert$
3. $E = \mathbb{R}^n$, $\lVert x \rVert_2      = \sqrt{x_1^2 + \cdots + x_n^2}$
4. $E = \mathbb{R}^n$, $\lVert x \rVert_\infty = \max \\{ \lvert x_1 \rvert, \dots, \lvert x_n \rvert \\}$
