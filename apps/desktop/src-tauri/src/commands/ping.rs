//! Ping command for testing the Tauri bridge.

/// Returns "pong" for bridge connectivity checks.
#[tauri::command]
pub fn ping() -> Result<String, String> {
    Ok("pong".into())
}
