//! Commit operations: read log, create commits, get details.

use git2::{Oid, Repository, Sort};
use serde::Serialize;

use super::error::GitError;

/// Commit info matching Angular expectations.
#[derive(Debug, Serialize, Clone)]
pub struct CommitInfo {
    pub sha: String,
    pub author: String,
    pub email: String,
    pub parents: Vec<String>,
    pub message: String,
    pub date: String,
    pub ci: String,
    #[serde(rename = "isStash")]
    pub is_stash: bool,
}

/// Get commit log for the current branch.
pub fn get_commits(repo: &Repository, max_count: usize) -> Result<Vec<CommitInfo>, GitError> {
    let mut revwalk = repo.revwalk().map_err(GitError::from)?;
    revwalk
        .set_sorting(Sort::TIME | Sort::TOPOLOGICAL)
        .map_err(GitError::from)?;
    revwalk.push_head().map_err(GitError::from)?;

    let mut commits = Vec::new();
    for (i, oid_result) in revwalk.enumerate() {
        if i >= max_count {
            break;
        }
        let oid = oid_result.map_err(GitError::from)?;
        let commit = repo.find_commit(oid).map_err(GitError::from)?;
        commits.push(commit_to_info(&commit));
    }
    Ok(commits)
}

/// Get a single commit by SHA.
pub fn get_commit(repo: &Repository, sha: &str) -> Result<CommitInfo, GitError> {
    let oid = Oid::from_str(sha).map_err(GitError::from)?;
    let commit = repo.find_commit(oid).map_err(GitError::from)?;
    Ok(commit_to_info(&commit))
}

/// Create a commit with all staged changes.
pub fn create_commit(
    repo: &Repository,
    message: &str,
    name: &str,
    email: &str,
) -> Result<String, GitError> {
    let sig = git2::Signature::now(name, email).map_err(GitError::from)?;
    let mut index = repo.index().map_err(GitError::from)?;
    let tree_oid = index.write_tree().map_err(GitError::from)?;
    let tree = repo.find_tree(tree_oid).map_err(GitError::from)?;

    let parent = match repo.head() {
        Ok(head) => Some(head.peel_to_commit().map_err(GitError::from)?),
        Err(_) => None,
    };

    let parents: Vec<&git2::Commit> = parent.iter().collect();
    let oid = repo
        .commit(Some("HEAD"), &sig, &sig, message, &tree, &parents)
        .map_err(GitError::from)?;

    Ok(oid.to_string())
}

/// Convert a git2 Commit into a serializable CommitInfo.
fn commit_to_info(commit: &git2::Commit) -> CommitInfo {
    let author = commit.author();
    CommitInfo {
        sha: commit.id().to_string(),
        author: author.name().unwrap_or("").to_string(),
        email: author.email().unwrap_or("").to_string(),
        parents: commit.parent_ids().map(|id| id.to_string()).collect(),
        message: commit.message().unwrap_or("").to_string(),
        date: epoch_to_iso(commit.time().seconds()),
        ci: String::new(),
        is_stash: false,
    }
}

/// Format epoch seconds as a string (no chrono dependency).
fn epoch_to_iso(seconds: i64) -> String {
    format!("{}", seconds)
}
