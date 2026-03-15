//! JIRA REST API v2 integration.
//!
//! Replicates `src/main/jira-integration/jira.js` using `reqwest`.
//! All functions are self-contained and stateless — the HTTP client is
//! built per-request from credentials stored in the OS keychain.

use base64::Engine;
use reqwest::blocking::Client;
use serde_json::Value;

const TIMEOUT_SECS: u64 = 10;

/// Build a JIRA REST API client with Basic Auth.
/// Returns `None` if required settings are missing.
pub fn build_client(repo_id: &str) -> Option<(Client, String)> {
    let enabled = crate::settings_store::get("jira-enabled")?;
    if enabled != "true" && enabled != "1" {
        return None;
    }

    let username = crate::settings_store::get("jira-username")?;
    let address = crate::settings_store::get("jira-address")?;
    let token_key = format!("jira-token@{repo_id}");
    let api_token = crate::secure::get_password(&token_key)?;

    if username.is_empty() || api_token.is_empty() || address.is_empty() {
        return None;
    }

    let auth = base64::engine::general_purpose::STANDARD
        .encode(format!("{username}:{api_token}"));
    let base_url = format!("https://{address}/rest/api/2");

    let client_with_auth = Client::builder()
        .timeout(std::time::Duration::from_secs(TIMEOUT_SECS))
        .default_headers({
            let mut headers = reqwest::header::HeaderMap::new();
            headers.insert(
                reqwest::header::AUTHORIZATION,
                format!("Basic {auth}").parse().unwrap(),
            );
            headers
        })
        .build()
        .ok()?;

    Some((client_with_auth, base_url))
}

/// GET /issue/{key}?expand=...
pub fn get_issue(client: &Client, base_url: &str, key: &str) -> Result<Value, String> {
    let url = format!(
        "{base_url}/issue/{key}?expand=renderedFields,names,transitions,transitions.fields,editmeta"
    );
    let resp = client.get(&url).send().map_err(|e| e.to_string())?;
    let mut data: Value = resp.json().map_err(|e| e.to_string())?;

    if let Some(rendered_desc) = data.pointer("/renderedFields/description").cloned() {
        if let Some(fields) = data.get_mut("fields").and_then(|f| f.as_object_mut()) {
            fields.insert("description".to_string(), rendered_desc);
        }
    }

    check_story_fields(&mut data);
    Ok(data)
}

/// POST /issue/{key}/comment
pub fn add_comment(
    client: &Client,
    base_url: &str,
    key: &str,
    body: &str,
) -> Result<Value, String> {
    let url = format!("{base_url}/issue/{key}/comment");
    client
        .post(&url)
        .json(&serde_json::json!({ "body": body }))
        .send()
        .map_err(|e| e.to_string())?;
    get_issue(client, base_url, key)
}

/// PUT /issue/{key} or POST /issue/{key}/transitions
pub fn update_issue(
    client: &Client,
    base_url: &str,
    key: &str,
    data: &Value,
) -> Result<Value, String> {
    let is_transition = data.get("transition").is_some();
    if is_transition {
        let url = format!("{base_url}/issue/{key}/transitions");
        client
            .post(&url)
            .json(data)
            .send()
            .map_err(|e| e.to_string())?;
    } else {
        let url = format!("{base_url}/issue/{key}");
        client
            .put(&url)
            .json(data)
            .send()
            .map_err(|e| e.to_string())?;
    }
    get_issue(client, base_url, key)
}

/// PUT /issue/{key}/assignee
pub fn assign_issue(
    client: &Client,
    base_url: &str,
    key: &str,
    name: &str,
) -> Result<Value, String> {
    let url = format!("{base_url}/issue/{key}/assignee");
    client
        .put(&url)
        .json(&serde_json::json!({ "name": name }))
        .send()
        .map_err(|e| e.to_string())?;
    get_issue(client, base_url, key)
}

/// GET /user/assignable/search?issueKey={key}&username={search}
pub fn find_assignable_users(
    client: &Client,
    base_url: &str,
    key: &str,
    search: Option<&str>,
) -> Result<Value, String> {
    let mut url = format!("{base_url}/user/assignable/search?issueKey={key}");
    if let Some(s) = search {
        url.push_str(&format!("&username={s}"));
    }
    let resp = client.get(&url).send().map_err(|e| e.to_string())?;
    resp.json().map_err(|e| e.to_string())
}

/// POST /issue (create subtask)
pub fn add_subtask(
    client: &Client,
    base_url: &str,
    key: &str,
    name: &str,
    project_id: &str,
    subtask_id: &str,
) -> Result<Value, String> {
    let url = format!("{base_url}/issue");
    client
        .post(&url)
        .json(&serde_json::json!({
            "fields": {
                "project": { "id": project_id },
                "parent": { "key": key },
                "issuetype": { "id": subtask_id },
                "summary": name,
            }
        }))
        .send()
        .map_err(|e| e.to_string())?;
    get_issue(client, base_url, key)
}

/// POST /search
pub fn search_issues(
    client: &Client,
    base_url: &str,
    jql: &str,
    fields: Option<&[String]>,
) -> Result<Value, String> {
    let url = format!("{base_url}/search");
    let mut body = serde_json::json!({ "jql": jql });
    if let Some(f) = fields {
        body["fields"] = serde_json::json!(f);
    }
    let resp = client.post(&url).json(&body).send().map_err(|e| e.to_string())?;
    let data: Value = resp.json().map_err(|e| e.to_string())?;
    Ok(data.get("issues").cloned().unwrap_or(serde_json::json!([])))
}

/// GET /resolution
pub fn get_resolutions(client: &Client, base_url: &str) -> Result<Value, String> {
    let url = format!("{base_url}/resolution");
    let resp = client.get(&url).send().map_err(|e| e.to_string())?;
    resp.json().map_err(|e| e.to_string())
}

/// GET /issuetype
pub fn get_issue_types(client: &Client, base_url: &str) -> Result<Value, String> {
    let url = format!("{base_url}/issuetype");
    let resp = client.get(&url).send().map_err(|e| e.to_string())?;
    resp.json().map_err(|e| e.to_string())
}

/// Extract Story Points from custom fields into `fields.storyPoints`.
fn check_story_fields(data: &mut Value) {
    let sp_field_key = if let Some(names) = data.get("names").and_then(|n| n.as_object()) {
        names
            .iter()
            .find(|(_, v)| v.as_str() == Some("Story Points"))
            .map(|(k, _)| k.clone())
    } else {
        None
    };

    if let Some(key) = sp_field_key {
        if let Some(value) = data.pointer(&format!("/fields/{key}")).cloned() {
            if let Some(fields) = data.get_mut("fields").and_then(|f| f.as_object_mut()) {
                fields.insert("storyPoints".to_string(), value);
            }
        }
    }
}
