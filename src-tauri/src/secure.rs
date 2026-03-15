//! Secure credential storage using OS keychain via the `keyring` crate.
//!
//! Maps the Electron `safeStorage` + `credentials.json` pattern to native
//! platform keychains (macOS Keychain, Windows Credential Manager, Linux
//! Secret Service).

const SERVICE_NAME: &str = "com.rhodiumcode.hetu";

/// Retrieve a password from the OS keychain.
/// Returns `None` if the entry does not exist or access fails.
pub fn get_password(account: &str) -> Option<String> {
    let entry = keyring::Entry::new(SERVICE_NAME, account).ok()?;
    entry.get_password().ok()
}

/// Store a password in the OS keychain.
/// Overwrites any existing entry for the same account.
pub fn set_password(account: &str, password: &str) -> Result<(), String> {
    let entry =
        keyring::Entry::new(SERVICE_NAME, account).map_err(|e| format!("keyring init: {e}"))?;
    entry
        .set_password(password)
        .map_err(|e| format!("keyring set: {e}"))
}

/// Delete a single credential from the OS keychain.
pub fn delete_password(account: &str) -> Result<(), String> {
    let entry =
        keyring::Entry::new(SERVICE_NAME, account).map_err(|e| format!("keyring init: {e}"))?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(format!("keyring delete: {e}")),
    }
}
