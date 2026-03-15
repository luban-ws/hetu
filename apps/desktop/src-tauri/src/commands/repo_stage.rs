//! Stage/unstage commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct StagePayload {
    #[serde(default)]
    pub files: Vec<String>,
}

/// Stage files by path.
#[tauri::command]
pub async fn repo_stage(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: StagePayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    git::status::stage(repo, &payload.files).map_err(|e| e.to_string())?;
    if let Ok(status) = git::status::get_status(repo) {
        let _ = app.emit("Repo-FileStatusRetrieved", &status);
    }
    Ok(())
}

/// Unstage files by path.
#[tauri::command]
pub async fn repo_unstage(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: StagePayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    git::status::unstage(repo, &payload.files).map_err(|e| e.to_string())?;
    if let Ok(status) = git::status::get_status(repo) {
        let _ = app.emit("Repo-FileStatusRetrieved", &status);
    }
    Ok(())
}

/// Discard all working directory changes.
#[tauri::command]
pub async fn repo_discard_all(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    git::status::discard_all(repo).map_err(|e| e.to_string())?;
    if let Ok(status) = git::status::get_status(repo) {
        let _ = app.emit("Repo-FileStatusRetrieved", &status);
    }
    Ok(())
}
