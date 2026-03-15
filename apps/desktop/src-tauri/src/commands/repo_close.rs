//! Repo close command.

use tauri::{AppHandle, Emitter, State};

use crate::state::AppState;

/// Drop the currently open repository and notify the frontend.
#[tauri::command]
pub async fn repo_close(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    *state.repo.lock() = None;
    let _ = app.emit("Repo-Closed", serde_json::json!({}));
    Ok(())
}
