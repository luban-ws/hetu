//! Application state shared across Tauri commands.

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use git2::Repository;
use parking_lot::Mutex;

/// Shared state holding the currently open repository and background timers.
pub struct AppState {
    pub repo: Mutex<Option<Repository>>,
    /// Cancellation flag for the auto-fetch background timer.
    pub auto_fetch_running: Arc<AtomicBool>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            repo: Mutex::new(None),
            auto_fetch_running: Arc::new(AtomicBool::new(false)),
        }
    }
}

impl AppState {
    /// Signal the auto-fetch timer to stop.
    pub fn stop_auto_fetch(&self) {
        self.auto_fetch_running.store(false, Ordering::SeqCst);
    }
}
