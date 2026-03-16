//! File detail and diff commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct FileDetailPayload {
    #[serde(default)]
    pub file: String,
    #[serde(default)]
    pub commit: String,
    #[serde(default, alias = "fullFile")]
    pub full_file: bool,
}

/// Get file diff detail for a specific file at a commit (or working tree).
#[tauri::command]
pub async fn repo_get_file_detail(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: FileDetailPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    match git::diff::get_file_detail(repo, &payload.file, &payload.commit, payload.full_file) {
        Ok(detail) => {
            let _ = app.emit("Repo-FileDetailRetrieved", &detail);
            Ok(())
        }
        Err(e) => {
            let _ = app.emit(
                "Repo-FileDetailNotFound",
                serde_json::json!({ "path": payload.file, "message": e.to_string() }),
            );
            Err(e.to_string())
        }
    }
}
