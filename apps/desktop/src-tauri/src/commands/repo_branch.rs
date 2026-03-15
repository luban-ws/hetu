//! Branch commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct CheckoutPayload {
    #[serde(default)]
    pub branch: String,
}

/// Checkout a branch by name.
#[tauri::command]
pub async fn repo_checkout(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: CheckoutPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    match git::branch::checkout(repo, &payload.branch) {
        Ok(info) => {
            let _ = app.emit("Repo-BranchChanged", &info);
            Ok(())
        }
        Err(e) => Err(e.to_string()),
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateBranchPayload {
    #[serde(default)]
    pub name: String,
    #[serde(default, alias = "commitSha")]
    pub commit_sha: String,
}

/// Create a new branch at the given commit.
#[tauri::command]
pub async fn repo_create_branch(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: CreateBranchPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    match git::branch::create_branch(repo, &payload.name, &payload.commit_sha) {
        Ok(()) => {
            let _ = app.emit(
                "Repo-BranchCreated",
                serde_json::json!({ "name": payload.name }),
            );
            Ok(())
        }
        Err(e) => Err(e.to_string()),
    }
}

#[derive(Debug, Deserialize)]
pub struct DeleteBranchPayload {
    #[serde(default)]
    pub name: String,
}

/// Delete a local branch by name.
#[tauri::command]
pub async fn repo_delete_branch(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: DeleteBranchPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    match git::branch::delete_branch(repo, &payload.name) {
        Ok(upstream) => {
            let _ = app.emit(
                "Repo-BranchDeleted",
                serde_json::json!({ "name": payload.name, "upstream": upstream }),
            );
            Ok(())
        }
        Err(e) => Err(e.to_string()),
    }
}
