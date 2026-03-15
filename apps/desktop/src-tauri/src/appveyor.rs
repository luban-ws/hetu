//! AppVeyor CI integration.
//!
//! Replicates `src/main/ci-integration/appveyor.js` using `reqwest`.

use reqwest::blocking::Client;
use serde::Serialize;
use serde_json::Value;

const BASE_URL: &str = "https://ci.appveyor.com/api";
const TIMEOUT_SECS: u64 = 10;

/// Formatted CI build entry sent to the frontend.
#[derive(Debug, Serialize, Clone)]
pub struct BuildEntry {
    pub commit: String,
    pub status: String,
    #[serde(rename = "buildId")]
    pub build_id: u64,
    pub build: u64,
    pub version: String,
    pub branch: String,
}

/// Build an AppVeyor API client with Bearer auth.
/// Returns `None` if settings or token are missing.
pub fn build_client(repo_id: &str) -> Option<(Client, String, String)> {
    let enabled = crate::settings_store::get("ci-appveyor")?;
    if enabled != "true" && enabled != "1" {
        return None;
    }

    let account = crate::settings_store::get("ci-appveyor-account")?;
    let project = crate::settings_store::get("ci-appveyor-project")?;
    let token_key = format!("ci-appveyor-token@{repo_id}");
    let token = crate::secure::get_password(&token_key)?;

    if token.is_empty() {
        return None;
    }

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(TIMEOUT_SECS))
        .default_headers({
            let mut headers = reqwest::header::HeaderMap::new();
            headers.insert(
                reqwest::header::AUTHORIZATION,
                format!("Bearer {token}").parse().unwrap(),
            );
            headers
        })
        .build()
        .ok()?;

    Some((client, account, project))
}

/// Fetch build history (up to `batches * 100` builds).
pub fn get_history(
    client: &Client,
    account: &str,
    project: &str,
    batches: usize,
) -> Result<Vec<BuildEntry>, String> {
    let mut all_builds = Vec::new();
    let mut start_build: Option<u64> = None;

    for _ in 0..batches {
        let mut url =
            format!("{BASE_URL}/projects/{account}/{project}/history?recordsNumber=100");
        if let Some(sb) = start_build {
            url.push_str(&format!("&startBuildId={sb}"));
        }
        let resp = client.get(&url).send().map_err(|e| e.to_string())?;
        let data: Value = resp.json().map_err(|e| e.to_string())?;

        let builds = data.get("builds").and_then(|b| b.as_array());
        if let Some(builds) = builds {
            let entries = format_builds(builds);
            if builds.len() == 100 {
                start_build = builds
                    .last()
                    .and_then(|b| b.get("buildId"))
                    .and_then(|id| id.as_u64());
            } else {
                all_builds.extend(entries);
                break;
            }
            all_builds.extend(entries);
        } else {
            break;
        }
    }

    dedup_by_commit(&mut all_builds);
    Ok(all_builds)
}

/// Fetch latest N builds (periodic polling).
pub fn get_recent(
    client: &Client,
    account: &str,
    project: &str,
    count: usize,
) -> Result<Vec<BuildEntry>, String> {
    let url =
        format!("{BASE_URL}/projects/{account}/{project}/history?recordsNumber={count}");
    let resp = client.get(&url).send().map_err(|e| e.to_string())?;
    let data: Value = resp.json().map_err(|e| e.to_string())?;
    let builds = data
        .get("builds")
        .and_then(|b| b.as_array())
        .cloned()
        .unwrap_or_default();
    let mut entries = format_builds(&builds);
    dedup_by_commit(&mut entries);
    Ok(entries)
}

/// Trigger a rebuild for a specific commit.
pub fn rebuild(
    client: &Client,
    account: &str,
    project: &str,
    branch: &str,
    commit: &str,
) -> Result<(), String> {
    let url = format!("{BASE_URL}/builds");
    client
        .post(&url)
        .json(&serde_json::json!({
            "accountName": account,
            "projectSlug": project,
            "branch": branch,
            "commitId": commit,
        }))
        .send()
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Get the build log for a specific build version.
pub fn get_build_log(
    client: &Client,
    account: &str,
    project: &str,
    version: &str,
) -> Result<Option<String>, String> {
    let url = format!("{BASE_URL}/projects/{account}/{project}/build/{version}");
    let resp = client.get(&url).send().map_err(|e| e.to_string())?;
    let data: Value = resp.json().map_err(|e| e.to_string())?;

    let job_id = data
        .pointer("/build/jobs/0/jobId")
        .and_then(|j| j.as_str());
    if let Some(job_id) = job_id {
        let log_url = format!("{BASE_URL}/buildjobs/{job_id}/log");
        let log_resp = client.get(&log_url).send().map_err(|e| e.to_string())?;
        let content = log_resp.text().map_err(|e| e.to_string())?;
        Ok(Some(content))
    } else {
        Ok(None)
    }
}

/// Convert raw JSON builds into `BuildEntry` structs.
fn format_builds(builds: &[Value]) -> Vec<BuildEntry> {
    builds
        .iter()
        .filter_map(|b| {
            Some(BuildEntry {
                commit: b.get("commitId")?.as_str()?.to_string(),
                status: b.get("status")?.as_str()?.to_string(),
                build_id: b.get("buildId")?.as_u64()?,
                build: b.get("buildNumber")?.as_u64()?,
                version: b.get("version")?.as_str()?.to_string(),
                branch: b.get("branch")?.as_str().unwrap_or("").to_string(),
            })
        })
        .collect()
}

/// Remove duplicate builds by commit SHA (keep first occurrence).
fn dedup_by_commit(builds: &mut Vec<BuildEntry>) {
    let mut seen = std::collections::HashSet::new();
    builds.retain(|b| seen.insert(b.commit.clone()));
}
