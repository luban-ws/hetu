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

/// Changed file entry in a commit.
#[derive(Debug, Serialize, Clone)]
pub struct CommitFileEntry {
    pub path: String,
    pub status: String,
}

/// Full commit detail including changed files.
#[derive(Debug, Serialize, Clone)]
pub struct CommitDetail {
    #[serde(flatten)]
    pub info: CommitInfo,
    pub files: Vec<CommitFileEntry>,
}

/// Get a single commit by SHA with its changed files list.
pub fn get_commit(repo: &Repository, sha: &str) -> Result<CommitDetail, GitError> {
    let oid = Oid::from_str(sha).map_err(GitError::from)?;
    let commit = repo.find_commit(oid).map_err(GitError::from)?;
    let info = commit_to_info(&commit);

    let tree = commit.tree().map_err(GitError::from)?;
    let parent_tree = if commit.parent_count() > 0 {
        Some(
            commit
                .parent(0)
                .map_err(GitError::from)?
                .tree()
                .map_err(GitError::from)?,
        )
    } else {
        None
    };

    let diff = repo
        .diff_tree_to_tree(parent_tree.as_ref(), Some(&tree), None)
        .map_err(GitError::from)?;

    let files: Vec<CommitFileEntry> = diff
        .deltas()
        .map(|delta| {
            let path = delta
                .new_file()
                .path()
                .unwrap_or_else(|| std::path::Path::new(""))
                .to_string_lossy()
                .to_string();
            let status = match delta.status() {
                git2::Delta::Added => "new",
                git2::Delta::Deleted => "deleted",
                git2::Delta::Modified => "modified",
                git2::Delta::Renamed => "renamed",
                git2::Delta::Copied => "copied",
                _ => "unknown",
            };
            CommitFileEntry {
                path,
                status: status.to_string(),
            }
        })
        .collect();

    Ok(CommitDetail { info, files })
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
