//! App version command.

/// Returns the application version (from Cargo.toml / package).
#[tauri::command]
pub fn get_app_version() -> Result<String, String> {
    Ok(env!("CARGO_PKG_VERSION").into())
}
