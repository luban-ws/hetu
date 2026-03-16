//! Tauri commands for OS-keychain credential storage.

/// Get a password from the OS keychain by account key.
#[tauri::command]
pub fn secure_get_password(account: String) -> Result<String, String> {
    Ok(crate::secure::get_password(&account).unwrap_or_default())
}

/// Store a password in the OS keychain.
#[tauri::command]
pub fn secure_set_password(account: String, password: String) -> Result<(), String> {
    crate::secure::set_password(&account, &password)
}

/// Delete a single credential from the OS keychain.
#[tauri::command]
pub fn secure_delete_password(account: String) -> Result<(), String> {
    crate::secure::delete_password(&account)
}

/// Clear all Hetu credentials from the OS keychain.
///
/// Iterates known credential patterns derived from the repository history
/// and deletes each entry. Emits `Secure-CacheCleared` on success.
#[tauri::command]
pub async fn secure_clear_cache(
    app: tauri::AppHandle,
    state: tauri::State<'_, crate::state::AppState>,
) -> Result<(), String> {
    use tauri::Emitter;
    // Collect repo-derived account keys from history
    let history = crate::repo_history::load_history();
    let mut errors = Vec::new();
    for entry in &history {
        let repo_id = &entry.name;
        // Common credential patterns
        for suffix in &["", "-username", "-password"] {
            let account = format!("{repo_id}{suffix}");
            if let Err(e) = crate::secure::delete_password(&account) {
                errors.push(e);
            }
        }
    }
    // Also remove any credentials stored by the repo lock guard
    let guard = state.repo.lock();
    if let Some(ref repo) = *guard {
        let repo_id = crate::git::repo::repo_name(repo);
        for suffix in &["", "-username", "-password"] {
            let account = format!("{repo_id}{suffix}");
            let _ = crate::secure::delete_password(&account);
        }
    }
    drop(guard);

    if errors.is_empty() {
        let _ = app.emit("Secure-CacheCleared", serde_json::json!({}));
        Ok(())
    } else {
        let _ = app.emit(
            "Secure-ClearCacheFailed",
            serde_json::json!({ "message": errors.join(", ") }),
        );
        Err(errors.join(", "))
    }
}
