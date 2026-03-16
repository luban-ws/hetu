---
title: Configuration
description: Settings, credentials, and per-repository configuration.
order: 4
---

# Configuration

Hetu stores settings and credentials using OS-native mechanisms. No config files need manual editing for typical usage.

## Application Settings

Global settings are persisted as JSON at:

```
~/Hetu/settings.json
```

This file is managed by the Rust `settings_store` module and updated atomically. Settings include:

| Key | Type | Description |
|-----|------|-------------|
| `lastOpenedRepo` | `string` | Path of the last repository opened |
| `recentRepos` | `string[]` | Recently opened repository paths |
| `jiraUrl` | `string` | JIRA instance base URL |
| `ciProvider` | `string` | CI integration provider (e.g., `"appveyor"`) |
| `theme` | `string` | UI theme (planned: `"dark"`, `"light"`, `"system"`) |

## Per-Repository Settings

Each repository has its own settings file:

```
~/Hetu/<repoId>.json
```

Where `<repoId>` is a unique identifier derived from the repository path. Per-repo settings include branch display preferences and local overrides.

## Credential Storage

Hetu uses your operating system's native credential manager — no passwords are ever stored in plain text.

| Platform | Backend |
|----------|---------|
| **macOS** | Keychain Services |
| **Windows** | Credential Manager |
| **Linux** | Secret Service (GNOME Keyring / KWallet) |

Credentials are scoped per remote URL. The Rust `keyring` crate provides a unified API across all platforms.

### Service Identifier

All credentials are stored under the service name:

```
com.rhodiumcode.hetu
```

### Troubleshooting Credentials

If you experience authentication issues:

1. Open your OS credential manager
2. Search for entries with service `com.rhodiumcode.hetu`
3. Delete stale entries and re-authenticate in Hetu

## JIRA Integration

To connect JIRA:

1. Open Hetu settings (gear icon)
2. Enter your JIRA instance URL (e.g., `https://yourteam.atlassian.net`)
3. Provide your JIRA email and API token
4. Credentials are stored in the OS keychain

Once connected, JIRA issue details appear alongside commits that reference issue keys (e.g., `PROJ-123`).

## CI Integration

AppVeyor build status is shown per-commit when configured:

1. Open Hetu settings
2. Enter your AppVeyor API token
3. Select the project to track
4. Build status indicators appear on the subway map
