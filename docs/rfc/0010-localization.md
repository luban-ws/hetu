# RFC 0010 — Localization (i18n) Support

**Status**: Draft  
**Date**: 2026-03-15  
**Author**: AI / Albert  

**Scope (one job)**: Add runtime i18n infrastructure and Chinese/English translations to the Hetu UI.

---

## Summary

Introduce runtime-switchable localization so the Hetu interface can render in English (default) or Simplified Chinese, with the user's language preference persisted in settings. The architecture must support adding more locales later without changing any infrastructure code.

## Motivation

1. Hetu's target audience includes Chinese-speaking developers (the app name itself is Chinese: 河图).
2. The existing `langulage: "en"` setting in Electron settings was never wired up — this RFC completes the intent.
3. A desktop app should let users switch language at runtime without rebuilding.

## Current State

| Item | Status |
|------|--------|
| `@angular/localize` | Installed, unused (compile-time only — not suitable for runtime switch) |
| `langulage: "en"` in `settings.js` | Typo'd key, never read by Angular |
| Translation files | None |
| Language picker in Settings UI | None |
| Tauri backend | No i18n concept |

## Detailed Design

### Library Choice: Transloco

| Criteria | `@angular/localize` | ngx-translate | **Transloco** |
|----------|---------------------|---------------|---------------|
| Runtime switch | No (build-per-locale) | Yes | **Yes** |
| Angular 20 support | Yes | Stale | **Active** |
| Lazy loading | N/A | Manual | **Built-in** |
| TypeScript | Partial | JS | **Full TS** |
| Community | Angular team | Legacy | **ngneat/transloco** |

**Decision**: Use **Transloco** for runtime locale switching. Remove unused `@angular/localize`.

### Architecture

```
src/renderer/
├── app/
│   ├── transloco-root.module.ts          # TranslocoModule config
│   └── transloco-loader.ts               # JSON file loader
├── assets/
│   └── i18n/
│       ├── en.json                       # English (default)
│       └── zh.json                       # Simplified Chinese
```

### Translation File Format

Flat keys with dot-notation namespacing:

```json
{
  "general.title": "General",
  "general.autoFetchInterval": "Auto Fetch Interval",
  "general.autoFetchInterval.hint": "Set to 0 to disable auto fetching",
  "general.pullOption": "Pull Option",
  "general.pullOption.ffonly": "Fast-Forward Only (Only pull when your local branch is not ahead)",
  "general.pullOption.rebase": "Rebase (Local commits will be rebase on top of remote)",
  "general.pullOption.merge": "Merge (Create merge commit if remote is ahead)",
  "general.cacheCleanup": "Auto Cache Cleanup",
  "general.tooltip": "Enable Tooltip",
  "general.clearCred": "Clear Cached Credentials",
  "general.clearCred.hint": "This will clear all cached repo login, SSH passphrase and all API tokens such as JIRA and AppVeyor access token",
  "settings.general": "General",
  "settings.profile": "Profile",
  "settings.auth": "Authentication",
  "settings.repo": "Repo Profile",
  "settings.ci": "CI",
  "settings.jira": "JIRA",
  "settings.update": "Update",
  "settings.back": "Back",
  "settings.language": "Language",
  "settings.theme": "Theme",
  "repo.open": "Open Repository",
  "repo.browse": "Browse",
  "repo.recent": "Recent Repositories",
  "repo.noRecent": "No recent repositories",
  "about.version": "Version",
  "about.github": "GitHub"
}
```

### Settings Key

| Key | Type | Values | Default |
|-----|------|--------|---------|
| `gen-language` | `string` | `"en"`, `"zh"` | `"en"` |

Fix the existing typo `langulage` → replace with the standardized `gen-language` key.

### Language Switch Flow

```
User selects language in Settings
  → SettingsService.setSetting("gen-language", "zh")
  → TranslocoService.setActiveLang("zh")
  → Transloco lazy-loads zh.json (if not cached)
  → All {{ t('key') }} bindings update reactively
  → Settings persisted to ~/Hetu/settings.json
  → On next startup, Settings-EffectiveUpdated carries gen-language
  → TranslocoService.setActiveLang() called in app init
```

### Template Usage Pattern

Before (hardcoded):
```html
<label>Auto Fetch Interval</label>
```

After (translatable):
```html
<ng-container *transloco="let t">
  <label>{{ t('general.autoFetchInterval') }}</label>
</ng-container>
```

Or with the structural directive at component level:
```html
<form *transloco="let t" class="mt-3">
  <label>{{ t('general.autoFetchInterval') }}</label>
  <small>{{ t('general.autoFetchInterval.hint') }}</small>
</form>
```

## Alternatives Considered

1. **`@angular/localize` (compile-time)**: Requires separate builds per locale. Unacceptable for a desktop app needing runtime switch.
2. **ngx-translate**: Aging library, no active maintainer. Transloco is its spiritual successor.
3. **Custom i18n service**: Unnecessary when Transloco provides exactly what we need with Angular integration.

## Migration Strategy

- Phase 1: Infrastructure (this RFC) — install Transloco, create `en.json`/`zh.json`, wire settings.
- Phase 2: Progressively replace hardcoded strings. Start with Settings UI (highest user visibility), then sidebar/toolbar, then detail panels.
- No breaking changes — untranslated strings remain as-is until converted.

## Testing Strategy

1. **Unit**: Transloco provides `TranslocoTestingModule` for isolated component tests.
2. **Manual**: Switch language in Settings → verify all visible text updates without page reload.
3. **Startup**: Kill and relaunch app → verify persisted language is restored.

## Implementation Plan (Detailed Steps)

### 1. Install Transloco, remove `@angular/localize`

```bash
npm install @jsverse/transloco
npm uninstall @angular/localize
```

### 2. Create Transloco config

- Create `src/renderer/app/transloco-loader.ts` — HTTP loader pointing to `assets/i18n/`
- Create `src/renderer/app/transloco-root.module.ts` — configure default lang, available langs, lazy loading

### 3. Create translation files

- Create `src/renderer/assets/i18n/en.json` — extract all user-visible strings from templates
- Create `src/renderer/assets/i18n/zh.json` — Chinese translations

### 4. Register TranslocoModule in AppModule

- Import `TranslocoRootModule` in the main AppModule
- Inject `TranslocoService` in `AppComponent` to set initial language from settings

### 5. Add language selector to General Settings

- Add a dropdown in `general-settings.component.html` with language options
- On change: call `SettingsService.setSetting("gen-language", value)` + `TranslocoService.setActiveLang(value)`
- In `getSettings()`: read `gen-language` and set Transloco's active lang

### 6. Wire startup restore

- In `AppComponent.ngOnInit` or settings init listener, read `gen-language` from effective settings
- Call `TranslocoService.setActiveLang()` with the persisted value

### 7. Convert Settings UI templates

- `general-settings.component.html` — wrap form in `*transloco="let t"`, replace hardcoded strings
- `settings-nav.component.html` — translate nav labels
- `jira-settings.component.html` — translate labels
- Other settings components

### 8. Convert core UI templates

- `action-toolbar` — tooltips and labels
- `branch-viewer` — section headers
- `open-repo-panel` — "Browse", "Recent Repositories", etc.
- `status-bar` — status messages
- `about-page` — labels
- `commit-detail` — panel headers

### 9. Fix legacy typo

- In `src/main/infrastructure/settings.js`: rename `langulage` to `gen-language` in defaults
- Ensure backward compatibility: if `langulage` exists in saved file, migrate it

### 10. Verify

- `npm run build` (Angular build succeeds)
- Switch language in Settings → all translated strings update
- Restart app → language persists

## Quality Gates

- [ ] Transloco installed and configured
- [ ] `en.json` and `zh.json` cover all Settings UI strings
- [ ] Language dropdown in General Settings works
- [ ] Language persisted to `~/Hetu/settings.json` under `gen-language`
- [ ] Language restored on app restart
- [ ] Tauri and Electron builds pass
- [ ] No regression in existing functionality

## Implementation Status

| Step | Description | Status |
|------|-------------|--------|
| 1 | Install Transloco | [ ] |
| 2 | Create Transloco config | [ ] |
| 3 | Create translation files | [ ] |
| 4 | Register in AppModule | [ ] |
| 5 | Language selector in Settings | [ ] |
| 6 | Startup restore | [ ] |
| 7 | Convert Settings templates | [ ] |
| 8 | Convert core UI templates | [ ] |
| 9 | Fix legacy typo | [ ] |
| 10 | Verify | [ ] |

## Open Questions

1. Should we support browser-locale auto-detection on first launch (fallback to `en` if not `zh`)?
2. Do we need right-to-left (RTL) support for future Arabic/Hebrew locales, or defer?
3. Should Tauri-side error messages (emitted via events) also be localized, or keep backend in English?
