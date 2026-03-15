//! Tauri commands for OS-keychain credential storage.

/// Get a password from the OS keychain by account key.
#[tauri::command]
pub fn secure_get_password(account: String) -> Result<String, String> {
    Ok(crate::secure::get_password(&account).unwrap_or_default())
}

/// Store a password in the OS keychain.
#[tauri::command]
pub fn secure_set_password(account: String, password: String) -> Result<(), String> {
    crate::secure::set_password(&account, &password)
}

/// Delete a single credential from the OS keychain.
#[tauri::command]
pub fn secure_delete_password(account: String) -> Result<(), String> {
    crate::secure::delete_password(&account)
}
