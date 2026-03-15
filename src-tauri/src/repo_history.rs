//! Repository history management.
//!
//! Persists recently opened repos and the active repo in `~/Hetu/settings.json`.
//! All disk I/O goes through `settings_store` to avoid dual-write races.
//!
//! JSON layout (matches the Electron format):
//! ```json
//! {
//!   "repos": [ { "name": "...", "workingDir": "...", "id": "..." }, ... ],
//!   "currentRepo": { "name": "...", "workingDir": "...", "id": "..." }
//! }
//! ```

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// A saved repository entry persisted to `~/Hetu/settings.json`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepoEntry {
    pub name: String,
    #[serde(rename = "workingDir")]
    pub working_dir: String,
    pub id: String,
}

/// Frontend-friendly history item emitted via `Repo-HistoryChanged`.
#[derive(Debug, Clone, Serialize)]
pub struct HistoryItem {
    pub name: String,
    pub path: String,
}

/// Load `repos` array from global settings.
pub fn get_repos() -> Vec<RepoEntry> {
    crate::settings_store::get_json("repos")
        .and_then(|v| serde_json::from_value::<Vec<RepoEntry>>(v).ok())
        .unwrap_or_default()
}

/// Load `currentRepo` object from global settings.
pub fn get_current_repo() -> Option<RepoEntry> {
    crate::settings_store::get_json("currentRepo")
        .and_then(|v| serde_json::from_value::<RepoEntry>(v).ok())
}

/// Get the working-dir path of the last active repo (convenience wrapper).
pub fn get_current_repo_path() -> Option<String> {
    get_current_repo().map(|r| r.working_dir)
}

/// Register `working_dir` as the active repo, adding it to history if new.
/// Returns the repo ID. Both `repos` and `currentRepo` are written atomically.
pub fn set_repo(working_dir: &str, name: &str) -> String {
    let mut repos = get_repos();

    let id = match repos.iter().find(|r| r.working_dir == working_dir) {
        Some(entry) => entry.id.clone(),
        None => {
            let new_id = uuid_v4();
            repos.push(RepoEntry {
                name: name.to_string(),
                working_dir: working_dir.to_string(),
                id: new_id.clone(),
            });
            new_id
        }
    };

    let current = RepoEntry {
        name: name.to_string(),
        working_dir: working_dir.to_string(),
        id: id.clone(),
    };

    let _ = crate::settings_store::set_many(&[
        ("repos", serde_json::to_value(&repos).unwrap_or(Value::Array(vec![]))),
        ("currentRepo", serde_json::to_value(&current).unwrap_or(Value::Null)),
    ]);

    id
}

/// Remove a repo from history. Clears `currentRepo` if it matched.
pub fn remove_repo(working_dir: &str) {
    let mut repos = get_repos();
    repos.retain(|r| r.working_dir != working_dir);

    let current = get_current_repo();
    let is_current = current.as_ref().map_or(false, |c| c.working_dir == working_dir);

    if is_current {
        let _ = crate::settings_store::set_many(&[
            ("repos", serde_json::to_value(&repos).unwrap_or(Value::Array(vec![]))),
            ("currentRepo", Value::Null),
        ]);
    } else {
        let _ = crate::settings_store::set_json(
            "repos",
            serde_json::to_value(&repos).unwrap_or(Value::Array(vec![])),
        );
    }
}

/// Get history as frontend-friendly items.
pub fn get_history() -> Vec<HistoryItem> {
    get_repos()
        .into_iter()
        .map(|r| HistoryItem {
            name: r.name,
            path: r.working_dir,
        })
        .collect()
}

/// Simple UUID v4 generator (no external dep).
fn uuid_v4() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    format!(
        "{:x}-{:x}-4{:x}-{:x}-{:x}",
        (seed >> 96) & 0xFFFF_FFFF,
        (seed >> 64) & 0xFFFF,
        (seed >> 48) & 0x0FFF,
        0x8000 | ((seed >> 32) & 0x3FFF),
        seed & 0xFFFF_FFFF_FFFF,
    )
}
