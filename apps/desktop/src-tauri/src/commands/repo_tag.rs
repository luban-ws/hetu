//! Tag commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateTagPayload {
    #[serde(default)]
    pub name: String,
    #[serde(default, alias = "targetSha")]
    pub target_sha: String,
}

#[derive(Debug, Deserialize)]
pub struct DeleteTagPayload {
    #[serde(default)]
    pub name: String,
}

/// Create a lightweight tag.
#[tauri::command]
pub async fn repo_create_tag(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: CreateTagPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    git::tag::create_tag(repo, &payload.name, &payload.target_sha).map_err(|e| e.to_string())?;
    let _ = app.emit(
        "Repo-TagCreated",
        serde_json::json!({ "name": payload.name }),
    );
    Ok(())
}

/// Delete a tag by name.
#[tauri::command]
pub async fn repo_delete_tag(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: DeleteTagPayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    git::tag::delete_tag(repo, &payload.name).map_err(|e| e.to_string())?;
    let _ = app.emit(
        "Repo-TagDeleted",
        serde_json::json!({ "name": payload.name }),
    );
    Ok(())
}
