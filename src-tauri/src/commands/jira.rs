//! Tauri commands for JIRA integration.

use serde::Deserialize;
use serde_json::Value;
use tauri::{AppHandle, Emitter};

/// Generic JIRA payload with a `key` field and optional extras.
#[derive(Debug, Deserialize)]
pub struct JiraPayload {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub key: Option<String>,
    #[serde(default)]
    pub body: Option<String>,
    #[serde(default)]
    pub data: Option<Value>,
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub search: Option<String>,
    #[serde(rename = "projectId", default)]
    pub project_id: Option<String>,
    #[serde(rename = "subtaskId", default)]
    pub subtask_id: Option<String>,
    #[serde(default)]
    pub jql: Option<String>,
    #[serde(default)]
    pub fields: Option<Vec<String>>,
}

/// Initialize JIRA connection when repo changes.
#[tauri::command]
pub async fn jira_repo_changed(app: AppHandle, payload: JiraPayload) -> Result<(), String> {
    let repo_id = payload.id.as_deref().unwrap_or("");
    if let Some((client, base_url)) = crate::jira::build_client(repo_id) {
        if let Ok(resolutions) = crate::jira::get_resolutions(&client, &base_url) {
            let _ = app.emit("JIRA-ResolutionsRetrieved", serde_json::json!({ "resolutions": resolutions }));
        }
        if let Ok(types) = crate::jira::get_issue_types(&client, &base_url) {
            let subtask = types
                .as_array()
                .and_then(|arr| arr.iter().find(|t| t.get("subtask") == Some(&Value::Bool(true))).cloned());
            let _ = app.emit("JIRA-IssueTypesRetrieved", serde_json::json!({
                "issueTypes": types,
                "subtaskType": subtask,
            }));
        }
    }
    Ok(())
}

/// Get a JIRA issue by key.
#[tauri::command]
pub async fn jira_get_issue(app: AppHandle, payload: JiraPayload) -> Result<(), String> {
    let key = payload.key.as_deref().ok_or("missing key")?;
    let repo_id = payload.id.as_deref().unwrap_or("");
    let (client, base_url) = crate::jira::build_client(repo_id).ok_or("JIRA not configured")?;
    match crate::jira::get_issue(&client, &base_url, key) {
        Ok(issue) => {
            let _ = app.emit("JIRA-IssueRetrieved", serde_json::json!({ "issue": issue }));
            Ok(())
        }
        Err(e) => {
            let _ = app.emit("JIRA-Error", serde_json::json!({ "error": e }));
            Err(e)
        }
    }
}

/// Add a comment to a JIRA issue.
#[tauri::command]
pub async fn jira_add_comment(app: AppHandle, payload: JiraPayload) -> Result<(), String> {
    let key = payload.key.as_deref().ok_or("missing key")?;
    let body = payload.body.as_deref().ok_or("missing body")?;
    let repo_id = payload.id.as_deref().unwrap_or("");
    let (client, base_url) = crate::jira::build_client(repo_id).ok_or("JIRA not configured")?;
    match crate::jira::add_comment(&client, &base_url, key, body) {
        Ok(issue) => {
            let _ = app.emit("JIRA-IssueRetrieved", serde_json::json!({ "issue": issue }));
            Ok(())
        }
        Err(e) => { let _ = app.emit("JIRA-Error", serde_json::json!({ "error": e })); Err(e) }
    }
}

/// Update a JIRA issue (fields or transition).
#[tauri::command]
pub async fn jira_update_issue(app: AppHandle, payload: JiraPayload) -> Result<(), String> {
    let key = payload.key.as_deref().ok_or("missing key")?;
    let data = payload.data.as_ref().ok_or("missing data")?;
    let repo_id = payload.id.as_deref().unwrap_or("");
    let (client, base_url) = crate::jira::build_client(repo_id).ok_or("JIRA not configured")?;
    match crate::jira::update_issue(&client, &base_url, key, data) {
        Ok(issue) => {
            let _ = app.emit("JIRA-IssueRetrieved", serde_json::json!({ "issue": issue }));
            Ok(())
        }
        Err(e) => { let _ = app.emit("JIRA-OperationFailed", serde_json::json!({})); Err(e) }
    }
}

/// Assign a JIRA issue.
#[tauri::command]
pub async fn jira_assign_issue(app: AppHandle, payload: JiraPayload) -> Result<(), String> {
    let key = payload.key.as_deref().ok_or("missing key")?;
    let name = payload.name.as_deref().ok_or("missing name")?;
    let repo_id = payload.id.as_deref().unwrap_or("");
    let (client, base_url) = crate::jira::build_client(repo_id).ok_or("JIRA not configured")?;
    match crate::jira::assign_issue(&client, &base_url, key, name) {
        Ok(issue) => {
            let _ = app.emit("JIRA-IssueRetrieved", serde_json::json!({ "issue": issue }));
            Ok(())
        }
        Err(e) => { let _ = app.emit("JIRA-Error", serde_json::json!({ "error": e })); Err(e) }
    }
}

/// Find assignable users for a JIRA issue.
#[tauri::command]
pub async fn jira_get_assignable_users(app: AppHandle, payload: JiraPayload) -> Result<(), String> {
    let key = payload.key.as_deref().ok_or("missing key")?;
    let repo_id = payload.id.as_deref().unwrap_or("");
    let (client, base_url) = crate::jira::build_client(repo_id).ok_or("JIRA not configured")?;
    match crate::jira::find_assignable_users(&client, &base_url, key, payload.search.as_deref()) {
        Ok(users) => {
            let _ = app.emit("JIRA-AssignableUsersRetrieved", serde_json::json!({
                "result": { "key": key, "result": users }
            }));
            Ok(())
        }
        Err(e) => { let _ = app.emit("JIRA-Error", serde_json::json!({ "error": e })); Err(e) }
    }
}

/// Add a subtask to a JIRA issue.
#[tauri::command]
pub async fn jira_add_subtask(app: AppHandle, payload: JiraPayload) -> Result<(), String> {
    let key = payload.key.as_deref().ok_or("missing key")?;
    let name = payload.name.as_deref().ok_or("missing name")?;
    let project_id = payload.project_id.as_deref().ok_or("missing projectId")?;
    let subtask_id = payload.subtask_id.as_deref().ok_or("missing subtaskId")?;
    let repo_id = payload.id.as_deref().unwrap_or("");
    let (client, base_url) = crate::jira::build_client(repo_id).ok_or("JIRA not configured")?;
    match crate::jira::add_subtask(&client, &base_url, key, name, project_id, subtask_id) {
        Ok(issue) => {
            let _ = app.emit("JIRA-IssueRetrieved", serde_json::json!({ "issue": issue }));
            Ok(())
        }
        Err(e) => { let _ = app.emit("JIRA-Error", serde_json::json!({ "error": e })); Err(e) }
    }
}

/// Search JIRA issues by JQL.
#[tauri::command]
pub async fn jira_search_issues(app: AppHandle, payload: JiraPayload) -> Result<(), String> {
    let jql = payload.jql.as_deref().ok_or("missing jql")?;
    let repo_id = payload.id.as_deref().unwrap_or("");
    let (client, base_url) = crate::jira::build_client(repo_id).ok_or("JIRA not configured")?;
    let fields_ref: Option<&[String]> = payload.fields.as_deref();
    match crate::jira::search_issues(&client, &base_url, jql, fields_ref) {
        Ok(issues) => {
            let _ = app.emit("JIRA-IssueQueryResultRetrieved", serde_json::json!({ "issues": issues }));
            Ok(())
        }
        Err(e) => {
            let _ = app.emit("JIRA-IssueQueryResultRetrieved", serde_json::json!({ "issues": [] }));
            Err(e)
        }
    }
}
