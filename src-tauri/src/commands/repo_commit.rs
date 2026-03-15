//! Commit creation commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct CommitPayload {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub files: Vec<String>,
}

/// Stage the given files then create a commit.
#[tauri::command]
pub async fn repo_commit(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: CommitPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;

    if !payload.files.is_empty() {
        if let Err(e) = git::status::stage(repo, &payload.files) {
            let _ = app.emit(
                "Repo-CommitFail",
                serde_json::json!({ "detail": e.message }),
            );
            return Ok(());
        }
    }

    match git::commit::create_commit(repo, &payload.message, &payload.name, &payload.email) {
        Ok(_sha) => {
            let _ = app.emit("Repo-Committed", serde_json::json!({}));
            if let Ok(commits) = git::commit::get_commits(repo, 500) {
                let _ = app.emit(
                    "Repo-CommitsUpdated",
                    serde_json::json!({ "commits": commits }),
                );
            }
            if let Ok(status) = git::status::get_status(repo) {
                let _ = app.emit("Repo-FileStatusRetrieved", &status);
            }
            Ok(())
        }
        Err(e) => {
            let _ = app.emit(
                "Repo-CommitFail",
                serde_json::json!({ "detail": e.message }),
            );
            Ok(())
        }
    }
}

/// Commit whatever is already staged (no additional staging).
#[tauri::command]
pub async fn repo_commit_staged(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: CommitPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;

    match git::commit::create_commit(repo, &payload.message, &payload.name, &payload.email) {
        Ok(_sha) => {
            let _ = app.emit("Repo-Committed", serde_json::json!({}));
            if let Ok(commits) = git::commit::get_commits(repo, 500) {
                let _ = app.emit(
                    "Repo-CommitsUpdated",
                    serde_json::json!({ "commits": commits }),
                );
            }
            if let Ok(status) = git::status::get_status(repo) {
                let _ = app.emit("Repo-FileStatusRetrieved", &status);
            }
            Ok(())
        }
        Err(e) => {
            let _ = app.emit(
                "Repo-CommitFail",
                serde_json::json!({ "detail": e.message }),
            );
            Ok(())
        }
    }
}
