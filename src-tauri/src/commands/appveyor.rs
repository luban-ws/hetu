//! Tauri commands for AppVeyor CI integration.

use serde::Deserialize;
use tauri::{AppHandle, Emitter};

const SERVICE_KEY: &str = "AppVeyor";

#[derive(Debug, Deserialize)]
pub struct CiPayload {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub commit: Option<String>,
    #[serde(default)]
    pub branch: Option<String>,
    #[serde(default)]
    pub version: Option<String>,
}

/// Handle repo change — fetch build history.
#[tauri::command]
pub async fn ci_repo_changed(app: AppHandle, payload: CiPayload) -> Result<(), String> {
    let repo_id = payload.id.as_deref().unwrap_or("");
    if let Some((client, account, project)) = crate::appveyor::build_client(repo_id) {
        let _ = app.emit("CI-QueryBegan", serde_json::json!({ "service": SERVICE_KEY }));
        match crate::appveyor::get_history(&client, &account, &project, 2) {
            Ok(builds) => {
                let _ = app.emit("CI-BuildsRetrieved", serde_json::json!({
                    "service": SERVICE_KEY,
                    "data": builds,
                }));
            }
            Err(e) => {
                let _ = app.emit("CI-RequestError", serde_json::json!({
                    "error": "GENERIC",
                    "detail": e,
                    "service": SERVICE_KEY,
                }));
            }
        }
    }
    Ok(())
}

/// Trigger a rebuild for a commit.
#[tauri::command]
pub async fn ci_appveyor_rebuild(app: AppHandle, payload: CiPayload) -> Result<(), String> {
    let repo_id = payload.id.as_deref().unwrap_or("");
    let commit = payload.commit.as_deref().ok_or("missing commit")?;
    let branch = payload.branch.as_deref().unwrap_or("master");
    let (client, account, project) =
        crate::appveyor::build_client(repo_id).ok_or("AppVeyor not configured")?;
    match crate::appveyor::rebuild(&client, &account, &project, branch, commit) {
        Ok(()) => {
            let _ = app.emit("CI-AppVeyorRebuilded", serde_json::json!({}));
            Ok(())
        }
        Err(e) => {
            let _ = app.emit("CI-AppVeyorRebuildFailed", serde_json::json!({}));
            Err(e)
        }
    }
}

/// Get build log for a version.
#[tauri::command]
pub async fn ci_appveyor_get_log(app: AppHandle, payload: CiPayload) -> Result<(), String> {
    let repo_id = payload.id.as_deref().unwrap_or("");
    let version = payload.version.as_deref().ok_or("missing version")?;
    let (client, account, project) =
        crate::appveyor::build_client(repo_id).ok_or("AppVeyor not configured")?;
    match crate::appveyor::get_build_log(&client, &account, &project, version) {
        Ok(Some(content)) => {
            let _ = app.emit("CI-AppVeyorLogRetrieved", serde_json::json!({
                "version": version,
                "result": content,
            }));
            Ok(())
        }
        Ok(None) => {
            let _ = app.emit("CI-AppVeyorLogNotFound", serde_json::json!({ "version": version }));
            Ok(())
        }
        Err(e) => Err(e),
    }
}
