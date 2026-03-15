//! Branch operations: create, checkout, delete, list.

use git2::{BranchType, Oid, Repository};
use serde::Serialize;

use super::error::GitError;

/// Branch info matching Angular expectations.
#[derive(Debug, Serialize, Clone)]
pub struct BranchInfo {
    pub name: String,
    pub target: String,
    pub shorthand: String,
    #[serde(rename = "isRemote")]
    pub is_remote: bool,
    #[serde(rename = "isBranch")]
    pub is_branch: bool,
    #[serde(rename = "isTag")]
    pub is_tag: bool,
}

/// Get the current branch info.
pub fn current_branch(repo: &Repository) -> Result<BranchInfo, GitError> {
    let head = repo.head().map_err(GitError::from)?;
    Ok(BranchInfo {
        name: head.shorthand().unwrap_or("HEAD").to_string(),
        target: head.target().map(|o| o.to_string()).unwrap_or_default(),
        shorthand: head.shorthand().unwrap_or("HEAD").to_string(),
        is_remote: false,
        is_branch: head.is_branch(),
        is_tag: false,
    })
}

/// Get all references (branches + tags) and a reverse mapping (OID -> ref names).
pub fn get_references(
    repo: &Repository,
) -> Result<(Vec<BranchInfo>, serde_json::Value), GitError> {
    let mut refs = Vec::new();
    let mut ref_dict = serde_json::Map::new();

    for reference in repo.references().map_err(GitError::from)? {
        let reference = reference.map_err(GitError::from)?;
        let name = reference.name().unwrap_or("").to_string();
        let target = reference
            .target()
            .map(|o| o.to_string())
            .unwrap_or_default();
        let shorthand = reference.shorthand().unwrap_or("").to_string();

        let is_remote = name.starts_with("refs/remotes/");
        let is_tag = name.starts_with("refs/tags/");
        let is_branch = name.starts_with("refs/heads/");

        let info = BranchInfo {
            name: shorthand.clone(),
            target: target.clone(),
            shorthand: shorthand.clone(),
            is_remote,
            is_branch,
            is_tag,
        };

        if !target.is_empty() {
            let entry = ref_dict
                .entry(target.clone())
                .or_insert_with(|| serde_json::json!([]));
            if let Some(arr) = entry.as_array_mut() {
                arr.push(serde_json::json!(shorthand));
            }
        }

        refs.push(info);
    }

    Ok((refs, serde_json::Value::Object(ref_dict)))
}

/// Create a new branch at the given commit.
pub fn create_branch(repo: &Repository, name: &str, commit_sha: &str) -> Result<(), GitError> {
    let oid = Oid::from_str(commit_sha).map_err(GitError::from)?;
    let commit = repo.find_commit(oid).map_err(GitError::from)?;
    repo.branch(name, &commit, false).map_err(GitError::from)?;
    Ok(())
}

/// Checkout a branch by name.
pub fn checkout(repo: &Repository, branch_name: &str) -> Result<BranchInfo, GitError> {
    let (object, reference) = repo.revparse_ext(branch_name).map_err(GitError::from)?;
    repo.checkout_tree(&object, None)
        .map_err(GitError::from)?;

    if let Some(reference) = reference {
        repo.set_head(reference.name().unwrap_or(""))
            .map_err(GitError::from)?;
    } else {
        repo.set_head_detached(object.id())
            .map_err(GitError::from)?;
    }

    current_branch(repo)
}

/// Delete a local branch by name. Returns the upstream ref name if one existed.
pub fn delete_branch(repo: &Repository, name: &str) -> Result<Option<String>, GitError> {
    let mut branch = repo
        .find_branch(name, BranchType::Local)
        .map_err(GitError::from)?;
    let upstream = branch
        .upstream()
        .ok()
        .and_then(|u| u.name().ok().flatten().map(|s| s.to_string()));
    branch.delete().map_err(GitError::from)?;
    Ok(upstream)
}

/// Get ahead/behind counts relative to upstream.
pub fn branch_position(repo: &Repository) -> Result<(usize, usize), GitError> {
    let head = repo.head().map_err(GitError::from)?;
    let local_oid = head.target().ok_or_else(|| GitError {
        code: "NotFound".to_string(),
        message: "HEAD has no target".to_string(),
    })?;

    let branch = git2::Branch::wrap(head);
    let upstream = match branch.upstream() {
        Ok(u) => u,
        Err(_) => return Ok((0, 0)),
    };
    let upstream_oid = upstream.get().target().ok_or_else(|| GitError {
        code: "NotFound".to_string(),
        message: "Upstream has no target".to_string(),
    })?;

    repo.graph_ahead_behind(local_oid, upstream_oid)
        .map_err(GitError::from)
}
