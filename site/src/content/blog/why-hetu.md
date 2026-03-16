---
title: "Why We Built Hetu"
date: "2026-03-01"
description: "Git history is a river — but most tools show you a spreadsheet. Hetu exists because developers deserve a better way to see where their code has been."
tags: ["vision", "design", "open-source"]
---

# Why We Built Hetu

Every developer uses Git. Few truly *see* it.

The terminal gives you `git log --oneline --graph` — a tangle of ASCII pipes and slashes that falls apart the moment branches get complex. GUI clients show flat lists with tiny colored lines crammed into a sidebar. Neither captures what Git history actually *is*: a river system, with tributaries merging, splitting, and flowing toward the same sea.

That image — a river map — is why Hetu (河图) exists.

## The Problem We Kept Running Into

Working on a team of eight, our daily standup started the same way: *"What merged into develop yesterday?"* Someone would open a Git client, squint at a spaghetti graph, and scroll for two minutes trying to reconstruct the narrative. Feature branches overlapped. Hotfixes cut across release candidates. Rebases rewrote the timeline. The graph was technically correct but practically useless.

We tried every major Git GUI. They all shared the same design assumption: the commit list is primary, and the graph is decoration. But for us, the graph *was* the information. We needed to see the shape of work — which streams were active, where they converged, and what the merge topology looked like — at a glance.

No tool gave us that.

## A Subway Map for Git

Cities solved this exact problem decades ago. Transit networks are complex directed graphs with merges, branches, and parallel lines. The solution was the subway map: a schematic that sacrifices geographic accuracy for topological clarity. Every line gets a distinct color. Stations are evenly spaced. The map tells you how things connect, not where they physically sit.

We applied the same principle to Git. In Hetu, each branch is a colored transit line. Commits are stations. Merges are interchanges. The result is a graph you can actually *read* — even when 15 branches are active simultaneously.

## Why "Hetu"?

河图 (Hé Tú) literally means "River Map" in Chinese. It refers to an ancient diagram from Chinese cosmology — one of the earliest known attempts to map the structure of a complex system. The name felt right: we're mapping the rivers of code that flow through a project's history.

It also nods to the project's origin. Hetu started as a fork of [MetroGit](https://github.com/Yamazaki93/MetroGit), a pioneering proof-of-concept that showed subway-map visualization was possible. We picked up where MetroGit left off, rebuilding the foundation while keeping the core insight intact.

## What We Changed

MetroGit demonstrated the idea. Hetu made it practical for daily use:

- **Tauri + Rust backend** — replaced Electron with a native shell that starts in under a second and uses a fraction of the memory
- **Real Git operations** — push, pull, commit, stash, branch, and checkout without leaving the app
- **JIRA integration** — issue details, subtasks, and comments appear alongside the commits that reference them
- **CI visibility** — build status indicators directly on the map, so you know which commits passed before you merge
- **OS-native credentials** — passwords stored in Keychain / Credential Manager / Secret Service, never in plain text

## The Philosophy

Hetu is opinionated about one thing: **visualization is not optional**. The graph is the primary interface, not a sidebar widget. Every feature we add must earn its place on the map or in the panels that surround it.

Beyond that, we follow a few principles:

1. **Desktop-native** — Git is a local tool. Your Git client should be too. No cloud accounts, no subscriptions, no telemetry.
2. **Fast and light** — Tauri gives us a ~15 MB binary that opens instantly. Rust handles Git operations without spawning child processes.
3. **Open source** — MIT licensed. Read the code, fork it, improve it.
4. **RFC-driven development** — Every architectural decision is documented in a public RFC before implementation. Transparency builds trust.

## Who Is Hetu For?

Hetu is for developers who:

- Work on teams where branch topology matters (feature branches, release trains, hotfix flows)
- Want to *see* their Git history, not just read it
- Use JIRA or similar issue trackers and want context alongside commits
- Prefer native desktop apps over web-based or Electron-heavy tools
- Value open source and want to understand (or modify) their tools

If you've ever stared at a Git graph and thought *"there has to be a better way to visualize this"* — that's exactly why we built Hetu.

## Try It

Hetu is free and open source. [Download it](/#download), [read the docs](/docs/getting-started), or [browse the source](https://github.com/luban-ws/hetu).

We'd love to hear what you think.
