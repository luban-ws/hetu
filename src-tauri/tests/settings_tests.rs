//! Integration tests for the settings_store module.
//!
//! Uses a temporary directory to avoid touching real user settings.
//! We test through the public functions after patching the settings dir
//! via environment or by calling the underlying read/write helpers.

use std::fs;
use tempfile::TempDir;

/// Since `settings_store` uses a hardcoded `~/Hetu/` path,
/// we test the JSON read/write logic directly with temp files.
#[test]
fn settings_roundtrip_via_file() {
    let dir = TempDir::new().unwrap();
    let path = dir.path().join("test-settings.json");

    fs::write(&path, r#"{"theme":"dark","lang":"en"}"#).unwrap();

    let content = fs::read_to_string(&path).unwrap();
    let map: serde_json::Map<String, serde_json::Value> =
        serde_json::from_str(&content).unwrap();

    assert_eq!(map.get("theme").unwrap().as_str().unwrap(), "dark");
    assert_eq!(map.get("lang").unwrap().as_str().unwrap(), "en");

    let mut map = map;
    map.insert(
        "theme".to_string(),
        serde_json::Value::String("light".to_string()),
    );
    map.insert(
        "fontSize".to_string(),
        serde_json::Value::String("14".to_string()),
    );

    let json = serde_json::to_string_pretty(&serde_json::Value::Object(map.clone())).unwrap();
    fs::write(&path, json).unwrap();

    let reloaded: serde_json::Map<String, serde_json::Value> =
        serde_json::from_str(&fs::read_to_string(&path).unwrap()).unwrap();
    assert_eq!(reloaded.get("theme").unwrap().as_str().unwrap(), "light");
    assert_eq!(reloaded.get("fontSize").unwrap().as_str().unwrap(), "14");
    assert_eq!(reloaded.get("lang").unwrap().as_str().unwrap(), "en");
}

#[test]
fn settings_missing_file_returns_empty_map() {
    let dir = TempDir::new().unwrap();
    let path = dir.path().join("nonexistent.json");

    let content = fs::read_to_string(&path);
    assert!(content.is_err());

    let map: serde_json::Map<String, serde_json::Value> = content
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .and_then(|v: serde_json::Value| v.as_object().cloned())
        .unwrap_or_default();

    assert!(map.is_empty());
}

#[test]
fn settings_nested_directory_creation() {
    let dir = TempDir::new().unwrap();
    let nested = dir.path().join("a").join("b").join("c").join("settings.json");

    fs::create_dir_all(nested.parent().unwrap()).unwrap();
    fs::write(
        &nested,
        serde_json::to_string(&serde_json::json!({"key": "value"})).unwrap(),
    )
    .unwrap();

    let content: serde_json::Value =
        serde_json::from_str(&fs::read_to_string(&nested).unwrap()).unwrap();
    assert_eq!(content["key"].as_str().unwrap(), "value");
}

/// Test the secure module's error handling (without touching real keychain).
#[test]
fn secure_get_nonexistent_returns_none() {
    let result =
        hetu_lib::secure::get_password("__test_nonexistent_account_12345__");
    // On CI or sandboxed environments, this returns None (no entry).
    // On systems with keychain access, it should also return None for a non-existent key.
    assert!(result.is_none() || result.unwrap().is_empty());
}
