---
title: Features
description: A walkthrough of Hetu's core features.
order: 3
---

# Features

## Subway-Map Visualization

The centerpiece of Hetu is its **subway-map** style commit graph. Instead of the typical flat DAG, branches are rendered as colored metro lines — making complex histories immediately legible.

![Main view](/screenshots/main-view.png)

- Each branch gets a distinct color (like a subway line)
- Merge commits show line junctions
- HEAD and branch labels appear as station markers
- Time flows vertically with relative timestamps on the left

## Inline Diff Viewer

Click any commit to see its changes without leaving the app. The diff viewer supports two modes:

![Diff view](/screenshots/diff-view.png)

- **Hunk view** — shows individual change blocks with line numbers
- **File view** — shows the complete file with highlighted modifications
- Syntax highlighting for common languages
- Addition (green) / deletion (red) markers

## JIRA Integration

Connect your JIRA instance to see issue details right alongside your commits:

![JIRA integration](/screenshots/jira-integration.png)

- Issue summary, status, assignee, and reporter
- Subtask list with completion status
- Recent comments timeline
- Click-through to JIRA web UI

## CI Build Status

AppVeyor build results appear per-commit directly on the subway map:

![CI integration](/screenshots/ci-integration.png)

- Green checkmark / red X on each commit node
- Overall build status panel
- On-demand build log download
- Periodic automatic refresh

## Repository Operations

All essential Git operations are built in:

- **Pull** with merge/rebase options and stash handling
- **Push** to remote with upstream tracking
- **Commit** with message editor
- **Stash / Pop** for work-in-progress
- **Create Branch** from any commit
- **Checkout** local and remote branches

## Credential Storage

Hetu uses your operating system's native credential manager:

- **macOS** — Keychain
- **Windows** — Credential Manager
- **Linux** — Secret Service (GNOME Keyring / KWallet)

No passwords stored in plain text. Credentials are scoped per remote URL.
