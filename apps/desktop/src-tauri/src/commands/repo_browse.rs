//! Tauri commands for folder browse dialogs, repo open, and repo history.

use serde::Deserialize;
use tauri::{AppHandle, Emitter};
use tauri_plugin_dialog::DialogExt;

/// Open a folder-picker dialog, then open the selected repo.
#[tauri::command]
pub async fn repo_browse(app: AppHandle) -> Result<(), String> {
    let path = app
        .dialog()
        .file()
        .set_title("Select Repository Directory")
        .blocking_pick_folder();

    if let Some(folder) = path {
        let path_str = folder.to_string();
        let _ = app.emit("Repo-FolderSelected", serde_json::json!({ "path": path_str }));
    }
    Ok(())
}

/// Open a folder-picker dialog for git-init target.
#[tauri::command]
pub async fn repo_init_browse(app: AppHandle) -> Result<(), String> {
    let path = app
        .dialog()
        .file()
        .set_title("Select Directory to Initialize Repository")
        .blocking_pick_folder();

    if let Some(folder) = path {
        let path_str = folder.to_string();
        let _ = app.emit("Repo-InitPathSelected", serde_json::json!({ "path": path_str }));
    }
    Ok(())
}

/// Open a file-picker dialog (for SSH key browse, etc.).
#[tauri::command]
pub async fn settings_browse_file(app: AppHandle) -> Result<(), String> {
    let path = app
        .dialog()
        .file()
        .set_title("Select File")
        .blocking_pick_file();

    if let Some(file) = path {
        let path_str = file.to_string();
        let _ = app.emit("Settings-FolderSelected", serde_json::json!({ "path": path_str }));
    }
    Ok(())
}

/// Response payload returned by `repo_get_history`.
#[derive(Debug, serde::Serialize)]
pub struct HistoryInitResponse {
    pub history: Vec<crate::repo_history::HistoryItem>,
    #[serde(rename = "currentRepo")]
    pub current_repo: Option<CurrentRepoInfo>,
}

/// Flattened current-repo info for the frontend.
#[derive(Debug, serde::Serialize)]
pub struct CurrentRepoInfo {
    #[serde(rename = "workingDir")]
    pub working_dir: String,
    pub name: String,
    pub id: String,
}

/// Startup initialisation: emit history + last-opened repo for auto-restore.
/// Returns the same data from invoke() as a safety net against event races.
#[tauri::command]
pub fn repo_get_history(app: AppHandle) -> Result<HistoryInitResponse, String> {
    let history = crate::repo_history::get_history();
    let _ = app.emit("Repo-HistoryChanged", serde_json::json!({ "history": history }));

    let current_repo = crate::repo_history::get_current_repo().map(|entry| {
        let info = CurrentRepoInfo {
            working_dir: entry.working_dir.clone(),
            name: entry.name.clone(),
            id: entry.id.clone(),
        };
        let _ = app.emit("Settings-EffectiveUpdated", serde_json::json!({
            "currentRepo": {
                "workingDir": entry.working_dir,
                "name": entry.name,
                "id": entry.id,
            }
        }));
        info
    });

    Ok(HistoryInitResponse { history, current_repo })
}

#[derive(Debug, Deserialize)]
pub struct RemoveHistoryPayload {
    #[serde(rename = "workingDir")]
    pub working_dir: String,
}

/// Remove a repo from history.
#[tauri::command]
pub fn repo_remove_history(app: AppHandle, payload: RemoveHistoryPayload) -> Result<(), String> {
    crate::repo_history::remove_repo(&payload.working_dir);
    let history = crate::repo_history::get_history();
    let _ = app.emit("Repo-HistoryChanged", serde_json::json!({ "history": history }));
    Ok(())
}
