//! Tauri commands for composite credential operations.
//!
//! Maps the Electron `Repo-SetCred` / credential retrieval flow to
//! OS-keychain-backed storage + settings.

use serde::Deserialize;

/// Payload for the set_credentials command.
#[derive(Debug, Deserialize)]
pub struct SetCredPayload {
    pub username: Option<String>,
    pub password: Option<String>,
}

/// Store credentials for the currently open repository.
///
/// Mirrors the Electron `setCredentials` handler:
/// - Saves username in per-repo settings
/// - Saves password in OS keychain keyed by `<username>@<remoteUrl>` (HTTPS)
///   or `<remoteUrl>` (SSH)
#[tauri::command]
pub fn set_credentials(
    payload: SetCredPayload,
    state: tauri::State<'_, crate::state::AppState>,
) -> Result<(), String> {
    let repo_guard = state.repo.lock();
    let repo = repo_guard.as_ref().ok_or("no repository open")?;

    let remote_url = first_remote_url(repo).unwrap_or_default();
    let is_ssh = remote_url.starts_with("git@") || remote_url.contains("ssh://");

    if let Some(ref username) = payload.username {
        if !username.is_empty() {
            let repo_id = crate::git::repo::repo_name(repo);
            let _ = crate::settings_store::set_repo(&repo_id, "auth-username", username);
        }
    }

    if let Some(ref password) = payload.password {
        if !password.is_empty() {
            let account = if is_ssh {
                remote_url.clone()
            } else {
                let username = payload.username.as_deref().unwrap_or("");
                format!("{username}@{remote_url}")
            };
            crate::secure::set_password(&account, password)?;
        }
    }

    Ok(())
}

/// Retrieve stored credentials for the currently open repository.
///
/// Returns `{ username, password }` or empty strings if not found.
#[tauri::command]
pub fn get_stored_credentials(
    state: tauri::State<'_, crate::state::AppState>,
) -> Result<serde_json::Value, String> {
    let repo_guard = state.repo.lock();
    let repo = repo_guard.as_ref().ok_or("no repository open")?;

    let repo_id = crate::git::repo::repo_name(repo);
    let remote_url = first_remote_url(repo).unwrap_or_default();
    let is_ssh = remote_url.starts_with("git@") || remote_url.contains("ssh://");

    let username = crate::settings_store::get_repo(&repo_id, "auth-username").unwrap_or_default();

    let password = if is_ssh {
        crate::secure::get_password(&remote_url).unwrap_or_default()
    } else {
        let account = format!("{username}@{remote_url}");
        crate::secure::get_password(&account).unwrap_or_default()
    };

    Ok(serde_json::json!({
        "username": username,
        "password": password,
    }))
}

/// Extract the URL of the first remote in the repository.
fn first_remote_url(repo: &git2::Repository) -> Option<String> {
    let remotes = repo.remotes().ok()?;
    let name = remotes.get(0)?;
    let remote = repo.find_remote(name).ok()?;
    remote.url().map(|s| s.to_string())
}
