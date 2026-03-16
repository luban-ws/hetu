//! Auto-fetch timer: periodically emits `AutoFetch-Timeout` to the frontend.

use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::Duration;

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct AutoFetchPayload {
    /// Interval in seconds between auto-fetch events.
    #[serde(default = "default_interval")]
    pub interval: u64,
}

fn default_interval() -> u64 {
    300
}

/// Start the auto-fetch background timer.
///
/// Emits `AutoFetch-Timeout` at the configured interval. The frontend
/// handles the actual fetch operation when it receives the event.
#[tauri::command]
pub async fn auto_fetch_start(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: AutoFetchPayload,
) -> Result<(), String> {
    let running = Arc::clone(&state.auto_fetch_running);

    // Stop any existing timer first
    running.store(false, Ordering::SeqCst);
    std::thread::sleep(Duration::from_millis(100));
    running.store(true, Ordering::SeqCst);

    let interval = Duration::from_secs(payload.interval.max(30));
    let flag = Arc::clone(&running);

    std::thread::spawn(move || {
        while flag.load(Ordering::SeqCst) {
            std::thread::sleep(interval);
            if !flag.load(Ordering::SeqCst) {
                break;
            }
            let _ = app.emit("AutoFetch-Timeout", serde_json::json!({}));
        }
    });

    Ok(())
}

/// Stop the auto-fetch background timer.
#[tauri::command]
pub async fn auto_fetch_stop(state: State<'_, AppState>) -> Result<(), String> {
    state.stop_auto_fetch();
    Ok(())
}
