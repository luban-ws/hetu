//! Tauri commands for application settings management.

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
