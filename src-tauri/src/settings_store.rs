//! Plain-JSON settings store mirroring the Electron `~/Hetu/settings.json`
//! and per-repo `<repoId>.json` files.

use serde_json::{Map, Value};
use std::fs;
use std::path::{Path, PathBuf};

/// Root directory: `~/Hetu/`
fn settings_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Hetu")
}

/// Global settings file path.
fn global_path() -> PathBuf {
    settings_dir().join("settings.json")
}

/// Per-repo settings file path.
fn repo_path(repo_id: &str) -> PathBuf {
    settings_dir().join(format!("{repo_id}.json"))
}

/// Read a JSON file into a serde_json::Map, returning empty map on error.
fn read_json(path: &Path) -> Map<String, Value> {
    fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str::<Value>(&s).ok())
        .and_then(|v| v.as_object().cloned())
        .unwrap_or_default()
}

/// Write a serde_json::Map back to a file, creating directories as needed.
fn write_json(path: &Path, map: &Map<String, Value>) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("mkdir: {e}"))?;
    }
    let json = serde_json::to_string_pretty(&Value::Object(map.clone()))
        .map_err(|e| format!("serialize: {e}"))?;
    fs::write(path, json).map_err(|e| format!("write: {e}"))
}

/// Get a global setting value as string.
pub fn get(key: &str) -> Option<String> {
    let map = read_json(&global_path());
    map.get(key).and_then(|v| match v {
        Value::String(s) => Some(s.clone()),
        other => Some(other.to_string()),
    })
}

/// Set a global setting value (string).
pub fn set(key: &str, value: &str) -> Result<(), String> {
    let mut map = read_json(&global_path());
    map.insert(key.to_string(), Value::String(value.to_string()));
    write_json(&global_path(), &map)
}

/// Get a global setting as raw JSON value.
pub fn get_json(key: &str) -> Option<Value> {
    let map = read_json(&global_path());
    map.get(key).cloned()
}

/// Set a global setting as raw JSON value.
pub fn set_json(key: &str, value: Value) -> Result<(), String> {
    let mut map = read_json(&global_path());
    map.insert(key.to_string(), value);
    write_json(&global_path(), &map)
}

/// Atomically set multiple keys at once (avoids repeated read-write cycles).
pub fn set_many(entries: &[(&str, Value)]) -> Result<(), String> {
    let mut map = read_json(&global_path());
    for (key, value) in entries {
        map.insert((*key).to_string(), value.clone());
    }
    write_json(&global_path(), &map)
}

/// Get a per-repo setting value.
pub fn get_repo(repo_id: &str, key: &str) -> Option<String> {
    let map = read_json(&repo_path(repo_id));
    map.get(key).and_then(|v| match v {
        Value::String(s) => Some(s.clone()),
        other => Some(other.to_string()),
    })
}

/// Set a per-repo setting value.
pub fn set_repo(repo_id: &str, key: &str, value: &str) -> Result<(), String> {
    let mut map = read_json(&repo_path(repo_id));
    map.insert(key.to_string(), Value::String(value.to_string()));
    write_json(&repo_path(repo_id), &map)
}

/// Get full global settings as JSON value.
pub fn get_all() -> Value {
    Value::Object(read_json(&global_path()))
}

/// Get full per-repo settings as JSON value.
pub fn get_all_repo(repo_id: &str) -> Value {
    Value::Object(read_json(&repo_path(repo_id)))
}
