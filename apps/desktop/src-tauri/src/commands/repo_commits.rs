//! Commits commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct GetCommitPayload {
    #[serde(default)]
    pub commit: String,
}

/// Fetch recent commit log (up to 500) and emit to frontend.
#[tauri::command]
pub async fn repo_get_commits(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    let commits = git::commit::get_commits(repo, 500).map_err(|e| e.to_string())?;
    let _ = app.emit(
        "Repo-CommitsUpdated",
        serde_json::json!({ "commits": commits }),
    );
    Ok(())
}

/// Fetch detail for a single commit by SHA.
#[tauri::command]
pub async fn repo_get_commit(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: GetCommitPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    match git::commit::get_commit(repo, &payload.commit) {
        Ok(info) => {
            let _ = app.emit(
                "Repo-CommitDetailRetrieved",
                serde_json::json!({ "commit": info }),
            );
            Ok(())
        }
        Err(e) => Err(e.to_string()),
    }
}
