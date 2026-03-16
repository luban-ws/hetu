//! Tauri commands for application settings management.

use tauri::{AppHandle, Emitter, State};

use crate::state::AppState;

/// Initialize settings: emits the full settings bundle and repo history.
///
/// Called by the frontend on startup (`Settings-Init`). Emits
/// `Settings-Updated` with global settings, `Settings-EffectiveUpdated`
/// with merged global+repo settings, and `Repo-HistoryChanged` with the repo list.
#[tauri::command]
pub async fn settings_init(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let global = crate::settings_store::get_all();

    // Merge repo-specific settings if a repo is open
    let effective = {
        let guard = state.repo.lock();
        if let Some(ref repo) = *guard {
            let repo_id = crate::git::repo::repo_name(repo);
            let repo_settings = crate::settings_store::get_all_repo(&repo_id);
            merge_settings(&global, &repo_settings)
        } else {
            global.clone()
        }
    };

    let _ = app.emit("Settings-Updated", &global);
    let _ = app.emit("Settings-EffectiveUpdated", &effective);

    let history = crate::repo_history::get_history();
    let _ = app.emit("Repo-HistoryChanged", &history);

    Ok(())
}

/// Merge global settings with repo-specific overrides.
fn merge_settings(
    global: &serde_json::Value,
    repo: &serde_json::Value,
) -> serde_json::Value {
    match (global, repo) {
        (serde_json::Value::Object(g), serde_json::Value::Object(r)) => {
            let mut merged = g.clone();
            for (k, v) in r {
                merged.insert(k.clone(), v.clone());
            }
            serde_json::Value::Object(merged)
        }
        _ => global.clone(),
    }
}

/// Get a global setting by key.
#[tauri::command]
pub fn settings_get(key: String) -> Result<String, String> {
    Ok(crate::settings_store::get(&key).unwrap_or_default())
}

/// Set a global setting.
#[tauri::command]
pub fn settings_set(key: String, value: String) -> Result<(), String> {
    crate::settings_store::set(&key, &value)
}

/// Get a per-repo setting by key.
#[tauri::command]
pub fn settings_get_repo(repo_id: String, key: String) -> Result<String, String> {
    Ok(crate::settings_store::get_repo(&repo_id, &key).unwrap_or_default())
}

/// Set a per-repo setting.
#[tauri::command]
pub fn settings_set_repo(repo_id: String, key: String, value: String) -> Result<(), String> {
    crate::settings_store::set_repo(&repo_id, &key, &value)
}

/// Get all global settings as JSON.
#[tauri::command]
pub fn settings_get_all() -> Result<serde_json::Value, String> {
    Ok(crate::settings_store::get_all())
}

/// Get all per-repo settings as JSON.
#[tauri::command]
pub fn settings_get_all_repo(repo_id: String) -> Result<serde_json::Value, String> {
    Ok(crate::settings_store::get_all_repo(&repo_id))
}

/// Get a secure per-repo setting (stored in OS keychain, keyed by `key@repoId`).
#[tauri::command]
pub fn settings_get_secure_repo(repo_id: String, key: String) -> Result<String, String> {
    let account = format!("{key}@{repo_id}");
    Ok(crate::secure::get_password(&account).unwrap_or_default())
}

/// Set a secure per-repo setting (stored in OS keychain).
#[tauri::command]
pub fn settings_set_secure_repo(
    repo_id: String,
    key: String,
    value: String,
) -> Result<(), String> {
    let account = format!("{key}@{repo_id}");
    crate::secure::set_password(&account, &value)
}
