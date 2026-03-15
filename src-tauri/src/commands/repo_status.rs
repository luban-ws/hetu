//! Status command.

use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

/// Query file status and emit the result.
#[tauri::command]
pub async fn repo_get_status(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    match git::status::get_status(repo) {
        Ok(status) => {
            let _ = app.emit("Repo-FileStatusRetrieved", &status);
            Ok(())
        }
        Err(e) => Err(e.to_string()),
    }
}
