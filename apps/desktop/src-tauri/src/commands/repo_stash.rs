//! Stash commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct StashSavePayload {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
    #[serde(default)]
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct StashIndexPayload {
    #[serde(default)]
    pub index: usize,
}

/// Save current changes to stash.
#[tauri::command]
pub async fn repo_stash_save(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: StashSavePayload,
) -> Result<(), String> {
    let mut guard = state.repo.lock();
    let repo = guard.as_mut().ok_or("No repository open")?;
    git::stash::stash_save(repo, &payload.name, &payload.email, &payload.message)
        .map_err(|e| e.to_string())?;
    let _ = app.emit("Repo-StashSaved", serde_json::json!({}));
    Ok(())
}

/// Pop a stash entry.
#[tauri::command]
pub async fn repo_stash_pop(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: StashIndexPayload,
) -> Result<(), String> {
    let mut guard = state.repo.lock();
    let repo = guard.as_mut().ok_or("No repository open")?;
    git::stash::stash_pop(repo, payload.index).map_err(|e| e.to_string())?;
    let _ = app.emit("Repo-StashPopped", serde_json::json!({}));
    Ok(())
}

/// Apply a stash without removing it.
#[tauri::command]
pub async fn repo_stash_apply(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: StashIndexPayload,
) -> Result<(), String> {
    let mut guard = state.repo.lock();
    let repo = guard.as_mut().ok_or("No repository open")?;
    git::stash::stash_apply(repo, payload.index).map_err(|e| e.to_string())?;
    let _ = app.emit("Repo-StashApplied", serde_json::json!({}));
    Ok(())
}

/// Drop a stash entry.
#[tauri::command]
pub async fn repo_stash_drop(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: StashIndexPayload,
) -> Result<(), String> {
    let mut guard = state.repo.lock();
    let repo = guard.as_mut().ok_or("No repository open")?;
    git::stash::stash_drop(repo, payload.index).map_err(|e| e.to_string())?;
    let _ = app.emit("Repo-StashDropped", serde_json::json!({}));
    Ok(())
}
