//! Reset commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct ResetPayload {
    #[serde(default, alias = "commitSha")]
    pub commit_sha: Option<String>,
    #[serde(default)]
    pub mode: String,
}

/// Reset the repository (hard or soft).
#[tauri::command]
pub async fn repo_reset(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: ResetPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    let sha_ref = payload.commit_sha.as_deref();

    let result = match payload.mode.as_str() {
        "soft" => git::reset::reset_soft(repo, sha_ref),
        _ => git::reset::reset_hard(repo, sha_ref),
    };

    match result {
        Ok(()) => {
            let _ = app.emit("Repo-Resetted", serde_json::json!({}));
            Ok(())
        }
        Err(e) => Err(e.to_string()),
    }
}
