# RFC 0011 — Theme System (Light / Dark / System)

**Status**: Draft  
**Date**: 2026-03-15  
**Author**: AI / Albert  

**Scope (one job)**: Introduce a CSS-variable-based theme system with Light, Dark, and System-follow modes, persisted in settings.

---

## Summary

Build a theme engine on top of the existing CSS custom property infrastructure. Define semantic color tokens alongside the existing sizing tokens. Users pick Light, Dark, or System (follows OS preference) from Settings. The choice persists in `~/Hetu/settings.json` and restores on startup. Tauri's native title bar follows the same theme via `window.setTheme()`.

## Motivation

1. The current UI has a single hardcoded dark-ish color scheme. Many developers work in well-lit environments and prefer a light theme.
2. OS-level dark mode is standard on macOS, Windows, and Linux — the app should respect it.
3. CSS custom properties for sizing already exist; extending to colors completes the design token system.
4. A theme system enables future customization (custom accent colors, high contrast, etc.).

## Current State

| Item | Status |
|------|--------|
| CSS custom properties | Sizing/spacing tokens in `:root` (no color tokens) |
| Bootstrap variables | `--primary`, `--gray-dark`, etc. — single palette |
| `prefers-color-scheme` | Not used anywhere |
| Tauri `set_theme` | Listed in capability schemas, not called |
| Theme setting in UI | None |
| Component SCSS files | Mix of hardcoded hex colors and Bootstrap vars |

## Detailed Design

### Color Token Architecture

Define two layers of tokens:

**Layer 1 — Primitive palette** (raw colors, never used directly in components):
```scss
// These are defined per-theme, never referenced by components
--color-gray-50: #f9fafb;
--color-gray-900: #111827;
--color-blue-500: #3b82f6;
// ...
```

**Layer 2 — Semantic tokens** (what components actually use):
```scss
// These reference primitives and flip per-theme
--app-bg: var(--color-gray-900);
--app-bg-surface: var(--color-gray-800);
--app-bg-elevated: var(--color-gray-700);
--app-text: var(--color-gray-100);
--app-text-secondary: var(--color-gray-400);
--app-text-muted: var(--color-gray-500);
--app-border: var(--color-gray-700);
--app-border-subtle: var(--color-gray-800);
--app-accent: var(--color-blue-500);
--app-accent-hover: var(--color-blue-400);
--app-danger: var(--color-red-500);
--app-success: var(--color-green-500);
--app-warning: var(--color-amber-500);
--app-sidebar-bg: var(--color-gray-850);
--app-toolbar-bg: var(--color-gray-800);
--app-input-bg: var(--color-gray-800);
--app-input-border: var(--color-gray-600);
--app-scrollbar-thumb: var(--color-gray-600);
--app-scrollbar-track: var(--color-gray-800);
--app-shadow: 0 2px 8px rgba(0,0,0,0.3);
```

### Theme Application via `data-theme` Attribute

```scss
// styles.scss

:root,
[data-theme="dark"] {
    // Dark primitives
    --color-gray-50: #f9fafb;
    --color-gray-100: #e5e7eb;
    // ...
    --color-gray-900: #111827;

    // Semantic tokens → dark values
    --app-bg: #0d1017;
    --app-bg-surface: #161b22;
    --app-bg-elevated: #21262d;
    --app-text: #e6edf3;
    --app-text-secondary: #8b949e;
    --app-border: #30363d;
    --app-accent: #58a6ff;
    // ...
}

[data-theme="light"] {
    --app-bg: #ffffff;
    --app-bg-surface: #f6f8fa;
    --app-bg-elevated: #ffffff;
    --app-text: #1f2328;
    --app-text-secondary: #656d76;
    --app-border: #d0d7de;
    --app-accent: #0969da;
    // ...
}

@media (prefers-color-scheme: light) {
    [data-theme="system"] {
        // Same as [data-theme="light"]
    }
}
@media (prefers-color-scheme: dark) {
    [data-theme="system"] {
        // Same as [data-theme="dark"]
    }
}
```

### Component Migration

Components replace hardcoded colors with semantic tokens:

Before:
```scss
.sidebar { background: #1e1e1e; color: #ccc; }
```

After:
```scss
.sidebar { background: var(--app-sidebar-bg); color: var(--app-text); }
```

### Settings Key

| Key | Type | Values | Default |
|-----|------|--------|---------|
| `gen-theme` | `string` | `"dark"`, `"light"`, `"system"` | `"system"` |

### Theme Switch Flow

```
User selects theme in Settings
  → SettingsService.setSetting("gen-theme", "light")
  → ThemeService.applyTheme("light")
    → document.documentElement.setAttribute("data-theme", "light")
    → (Tauri) invoke("plugin:window|set_theme", { theme: "Light" })
  → Settings persisted to ~/Hetu/settings.json
  → On next startup: read gen-theme → applyTheme()
```

### ThemeService

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly SETTING_KEY = 'gen-theme';
  private readonly DEFAULT_THEME = 'system';

  constructor(
    private settings: SettingsService,
    private adapter: DesktopAdapter
  ) {}

  /** Apply theme to DOM and native window. */
  applyTheme(theme: string): void {
    const resolved = theme || this.DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', resolved);

    // Sync Tauri native title bar theme
    if (resolved !== 'system') {
      this.adapter.send('Window-SetTheme', { theme: resolved });
    }
  }

  /** Read persisted theme from settings and apply. */
  restoreTheme(): void {
    const saved = this.settings.getAppSetting(this.SETTING_KEY);
    this.applyTheme(saved || this.DEFAULT_THEME);
  }
}
```

### Tauri Native Window Theme

Tauri 2.x supports `window.set_theme()` for native title bar color. Add a command:

```rust
// src-tauri/src/commands/window_theme.rs
#[tauri::command]
pub fn set_window_theme(window: tauri::Window, theme: String) -> Result<(), String> {
    let tauri_theme = match theme.to_lowercase().as_str() {
        "light" => Some(tauri::Theme::Light),
        "dark" => Some(tauri::Theme::Dark),
        _ => None,  // system default
    };
    window.set_theme(tauri_theme).map_err(|e| e.to_string())
}
```

## Alternatives Considered

1. **SCSS `$variables` with theme files**: Compile-time only. Cannot switch without rebuilding CSS.
2. **CSS `@layer` per theme**: Overly complex for two themes. Custom properties are simpler and widely supported.
3. **Tailwind CSS dark mode**: Would require migrating the entire CSS architecture. Too invasive for this scope.
4. **JavaScript inline styles**: Unmaintainable at scale. CSS variables are the standard approach.

## Migration Strategy

- **Phase 1 (this RFC)**: Define tokens, create `ThemeService`, add theme picker in Settings, convert global styles and 5 core components.
- **Phase 2 (incremental)**: Convert remaining component SCSS files. Each component is independent — no ordering dependency.
- **Backward compatible**: Unreplaced hardcoded colors still render correctly; they just won't respond to theme switch until converted.

## Testing Strategy

1. **Visual**: Switch between Light / Dark / System in Settings — verify no broken contrast or invisible elements.
2. **Persistence**: Change theme → restart app → verify same theme loads.
3. **System follow**: Set to "System" → toggle OS dark mode → verify app follows.
4. **Tauri native**: Verify title bar color matches app theme on macOS/Windows.
5. **No regression**: Existing dark-ish appearance is preserved as the Dark theme default.

## Implementation Plan (Detailed Steps)

### 1. Define semantic color tokens in `styles.scss`

- Add `:root` / `[data-theme="dark"]` block with dark palette primitives + semantic tokens
- Add `[data-theme="light"]` block with light palette
- Add `[data-theme="system"]` blocks inside `@media (prefers-color-scheme: ...)` queries
- Keep existing sizing tokens untouched

### 2. Create `ThemeService`

- Create `src/renderer/app/core/services/theme.service.ts`
- Methods: `applyTheme(theme)`, `restoreTheme()`, `getCurrentTheme()`
- Inject `SettingsService` and `DesktopAdapter`

### 3. Wire theme restore on startup

- In `AppComponent` (or `app.component.ts`), inject `ThemeService` and call `restoreTheme()` in `ngOnInit`
- Also call on `Settings-EffectiveUpdated` event for dynamic updates

### 4. Add theme selector to General Settings

- Add a `<select>` dropdown in `general-settings.component.html` with options: System, Light, Dark
- On change: `SettingsService.setSetting("gen-theme", value)` + `ThemeService.applyTheme(value)`
- In `getSettings()`: read `gen-theme` and initialize the dropdown

### 5. Add Tauri command for native window theme

- Create `src-tauri/src/commands/window_theme.rs` with `set_window_theme` command
- Register in `lib.rs`
- Add `Window-SetTheme` mapping in `tauri-adapter.ts`

### 6. Convert global styles

- In `styles.scss`: replace `body` background/color, `h1`-`h6` colors, `.btn` colors, scrollbar colors with semantic tokens
- Update Bootstrap overrides to use tokens

### 7. Convert core component SCSS (first batch)

- `action-toolbar.component.scss` — toolbar background, icon colors
- `branch-viewer.component.scss` — sidebar background, text, borders
- `status-bar.component.scss` — background, text color
- `open-repo-panel.component.scss` — panel background, close button, recent list
- `subway-stations.component.scss` — commit row background, text, borders

### 8. Convert detail panel SCSS (second batch)

- `commit-detail.component.scss`
- `commit-detail-info.component.scss`
- `commit-file-list.component.scss`
- `file-view-panel.component.scss`
- `settings-nav.component.scss`

### 9. Convert remaining components

- `branch-item.component.scss`
- `committer-card.component.scss`
- `subway-station-annot.component.scss`
- `git-init-prompt.component.scss`
- `loading-screen.component.css`

### 10. Verify

- Toggle Light / Dark / System in Settings
- Verify all component colors respond correctly
- Verify Tauri native window theme syncs
- `cargo build` + `vite build` pass
- Restart app → theme persists

## Quality Gates

- [ ] Semantic color tokens defined for both Light and Dark
- [ ] `ThemeService` created and wired to startup
- [ ] Theme dropdown in General Settings persists and applies
- [ ] At least 10 core component SCSS files converted to use tokens
- [ ] No hardcoded colors in converted components
- [ ] Tauri native title bar follows app theme
- [ ] Both Tauri and Electron builds pass
- [ ] No visual regression in Dark theme (existing default appearance)

## Implementation Status

| Step | Description | Status |
|------|-------------|--------|
| 1 | Define color tokens | [ ] |
| 2 | Create ThemeService | [ ] |
| 3 | Wire startup restore | [ ] |
| 4 | Theme selector in Settings | [ ] |
| 5 | Tauri native window theme | [ ] |
| 6 | Convert global styles | [ ] |
| 7 | Convert core components | [ ] |
| 8 | Convert detail panels | [ ] |
| 9 | Convert remaining components | [ ] |
| 10 | Verify | [ ] |

## Open Questions

1. Should we define a third "high contrast" theme for accessibility, or defer?
2. Should the accent color be user-customizable (color picker), or fixed per theme?
3. Do we need Bootstrap CSS overrides, or can we drop Bootstrap in favor of pure custom-property-based styles in a future RFC?
4. Should subway graph colors (blue/green/orange branch lines) change with theme, or remain fixed for recognizability?
