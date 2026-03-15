//! Remote commands: fetch, push with auto-loaded keychain credentials.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::git::remote::RemoteCreds;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct RemotePayload {
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub password: Option<String>,
    #[serde(default)]
    pub force: bool,
}

/// Build credentials: use payload values if present, otherwise load from keychain.
fn resolve_creds(repo: &git2::Repository, payload: &RemotePayload) -> RemoteCreds {
    let repo_id = git::repo::repo_name(repo);
    let remote_url = first_remote_url(repo).unwrap_or_default();
    let is_ssh = remote_url.starts_with("git@") || remote_url.contains("ssh://");

    let username = payload
        .username
        .clone()
        .or_else(|| crate::settings_store::get_repo(&repo_id, "auth-username"));
    let password = payload.password.clone().or_else(|| {
        if is_ssh {
            crate::secure::get_password(&remote_url)
        } else {
            let user = username.as_deref().unwrap_or("");
            crate::secure::get_password(&format!("{user}@{remote_url}"))
        }
    });

    let ssh_key_path = if is_ssh {
        crate::settings_store::get_repo(&repo_id, "auth-keypath")
            .or_else(|| crate::settings_store::get("auth-keypath"))
    } else {
        None
    };
    let ssh_pub_path = if is_ssh {
        crate::settings_store::get_repo(&repo_id, "auth-pubpath")
            .or_else(|| crate::settings_store::get("auth-pubpath"))
    } else {
        None
    };

    let ssh_passphrase = if is_ssh { password.clone() } else { None };
    RemoteCreds {
        username,
        password,
        ssh_key_path,
        ssh_pub_path,
        ssh_passphrase,
    }
}

fn first_remote_url(repo: &git2::Repository) -> Option<String> {
    let remotes = repo.remotes().ok()?;
    let name = remotes.get(0)?;
    let remote = repo.find_remote(name).ok()?;
    remote.url().map(|s| s.to_string())
}

/// Fetch from the default remote.
#[tauri::command]
pub async fn repo_fetch(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: RemotePayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    let creds = resolve_creds(repo, &payload);
    match git::remote::fetch(repo, &creds) {
        Ok(()) => {
            let _ = app.emit("Repo-Fetched", serde_json::json!({}));
            Ok(())
        }
        Err(e) => {
            let _ = app.emit("Repo-CredentialIssue", serde_json::json!({}));
            Err(e.to_string())
        }
    }
}

/// Push to the default remote.
#[tauri::command]
pub async fn repo_push(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: RemotePayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    let creds = resolve_creds(repo, &payload);
    match git::remote::push(repo, &creds, payload.force) {
        Ok(()) => {
            let _ = app.emit("Repo-Pushed", serde_json::json!({}));
            Ok(())
        }
        Err(e) => {
            let _ = app.emit("Repo-CredentialIssue", serde_json::json!({}));
            Err(e.to_string())
        }
    }
}
