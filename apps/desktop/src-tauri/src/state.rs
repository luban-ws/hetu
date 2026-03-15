//! Application state shared across Tauri commands.

use git2::Repository;
use parking_lot::Mutex;

/// Shared state holding the currently open repository.
pub struct AppState {
    pub repo: Mutex<Option<Repository>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            repo: Mutex::new(None),
        }
    }
}
