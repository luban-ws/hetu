//! Repo open/init/browse commands.

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::git;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct OpenPayload {
    #[serde(default, alias = "workingDir")]
    pub path: String,
}

/// Open an existing repository, emit initial state to the frontend.
#[tauri::command]
pub async fn repo_open(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: OpenPayload,
) -> Result<(), String> {
    let path = payload.path.clone();
    match git::repo::open(&path) {
        Ok(repo) => {
            let name = git::repo::repo_name(&repo);
            let wd = git::repo::working_dir(&repo);

            let status = git::status::get_status(&repo).ok();
            let commits = git::commit::get_commits(&repo, 500).unwrap_or_default();
            let branch = git::branch::current_branch(&repo).ok();
            let (refs, ref_dict) = git::branch::get_references(&repo).unwrap_or_default();
            let position = git::branch::branch_position(&repo).unwrap_or((0, 0));
            let remote = repo
                .remotes()
                .ok()
                .and_then(|r| r.get(0).map(|s| s.to_string()))
                .unwrap_or_default();

            crate::repo_history::set_repo(&wd, &name);

            *state.repo.lock() = Some(repo);

            let _ = app.emit(
                "Repo-OpenSuccessful",
                serde_json::json!({
                    "workingDir": wd,
                    "repoName": name,
                }),
            );

            let history = crate::repo_history::get_history();
            let _ = app.emit("Repo-HistoryChanged", serde_json::json!({ "history": history }));

            if let Some(branch) = branch {
                let _ = app.emit("Repo-BranchChanged", &branch);
            }
            let _ = app.emit(
                "Repo-CommitsUpdated",
                serde_json::json!({ "commits": commits }),
            );
            let _ = app.emit(
                "Repo-BranchPositionRetrieved",
                serde_json::json!({ "ahead": position.0, "behind": position.1 }),
            );
            let _ = app.emit(
                "Repo-RefRetrieved",
                serde_json::json!({ "references": refs, "refDict": ref_dict }),
            );
            let _ = app.emit(
                "Repo-RemotesChanged",
                serde_json::json!({ "remote": remote }),
            );
            if let Some(status) = status {
                let _ = app.emit("Repo-FileStatusRetrieved", &status);
            }
            Ok(())
        }
        Err(e) => {
            let is_not_repo = e.code.contains("NotFound") || e.message.contains("not a git repository");
            let dir_exists = std::path::Path::new(&path).is_dir();
            let _ = app.emit(
                "Repo-OpenFailed",
                serde_json::json!({
                    "error": if is_not_repo && dir_exists { "NOT_GIT_REPOSITORY" } else { "OPEN_FAILED" },
                    "canInitialize": is_not_repo && dir_exists,
                    "detail_message": e.message,
                    "workingDir": path,
                }),
            );
            Ok(())
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct InitPayload {
    #[serde(default)]
    pub path: String,
}

/// Initialise a brand-new repository.
#[tauri::command]
pub async fn repo_init(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: InitPayload,
) -> Result<(), String> {
    match git::repo::init(&payload.path) {
        Ok(repo) => {
            let wd = git::repo::working_dir(&repo);
            *state.repo.lock() = Some(repo);
            let _ = app.emit(
                "Repo-InitSuccessful",
                serde_json::json!({ "path": wd }),
            );
            Ok(())
        }
        Err(e) => {
            let _ = app.emit(
                "Repo-InitFailed",
                serde_json::json!({ "detail": e.message }),
            );
            Ok(())
        }
    }
}
