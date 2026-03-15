//! Git status: file status, staging, unstaging.

use git2::{Repository, Status as GitStatus, StatusOptions};
use serde::Serialize;

use super::error::GitError;

/// File entry with path and status.
#[derive(Debug, Serialize, Clone)]
pub struct FileEntry {
    pub path: String,
    pub status: String,
}

/// File status summary.
#[derive(Debug, Serialize, Clone, Default)]
pub struct StatusSummary {
    pub ignored: usize,
    #[serde(rename = "newCount")]
    pub new_count: usize,
    pub deleted: usize,
    pub modified: usize,
    pub renamed: usize,
}

/// Full status result matching Angular expectations.
#[derive(Debug, Serialize, Clone)]
pub struct FileStatus {
    pub summary: serde_json::Value,
    pub staged: Vec<FileEntry>,
    pub unstaged: Vec<FileEntry>,
    #[serde(rename = "stagedSummary")]
    pub staged_summary: StatusSummary,
    #[serde(rename = "unstagedSummary")]
    pub unstaged_summary: StatusSummary,
}

/// Index status flags that indicate staged changes.
const STAGED_FLAGS: GitStatus = GitStatus::from_bits_truncate(
    GitStatus::INDEX_NEW.bits()
        | GitStatus::INDEX_MODIFIED.bits()
        | GitStatus::INDEX_DELETED.bits()
        | GitStatus::INDEX_RENAMED.bits()
        | GitStatus::INDEX_TYPECHANGE.bits(),
);

/// Worktree status flags that indicate unstaged changes.
const UNSTAGED_FLAGS: GitStatus = GitStatus::from_bits_truncate(
    GitStatus::WT_NEW.bits()
        | GitStatus::WT_MODIFIED.bits()
        | GitStatus::WT_DELETED.bits()
        | GitStatus::WT_RENAMED.bits()
        | GitStatus::WT_TYPECHANGE.bits(),
);

/// Get the current file status of the repository.
pub fn get_status(repo: &Repository) -> Result<FileStatus, GitError> {
    let mut opts = StatusOptions::new();
    opts.include_untracked(true)
        .renames_head_to_index(true)
        .renames_index_to_workdir(true);

    let statuses = repo.statuses(Some(&mut opts)).map_err(GitError::from)?;

    let mut staged = Vec::new();
    let mut unstaged = Vec::new();
    let mut staged_summary = StatusSummary::default();
    let mut unstaged_summary = StatusSummary::default();

    for entry in statuses.iter() {
        let path = entry.path().unwrap_or("").to_string();
        let status = entry.status();

        if status.intersects(STAGED_FLAGS) {
            let status_str = classify_staged(status, &mut staged_summary);
            staged.push(FileEntry {
                path: path.clone(),
                status: status_str.to_string(),
            });
        }

        if status.intersects(UNSTAGED_FLAGS) {
            let status_str = classify_unstaged(status, &mut unstaged_summary);
            unstaged.push(FileEntry {
                path: path.clone(),
                status: status_str.to_string(),
            });
        }
    }

    Ok(FileStatus {
        summary: serde_json::json!({}),
        staged,
        unstaged,
        staged_summary,
        unstaged_summary,
    })
}

/// Stage files by path.
pub fn stage(repo: &Repository, paths: &[String]) -> Result<(), GitError> {
    let mut index = repo.index().map_err(GitError::from)?;
    for path in paths {
        index
            .add_path(std::path::Path::new(path))
            .map_err(GitError::from)?;
    }
    index.write().map_err(GitError::from)?;
    Ok(())
}

/// Unstage files by path (reset to HEAD).
pub fn unstage(repo: &Repository, paths: &[String]) -> Result<(), GitError> {
    let head = repo.head().map_err(GitError::from)?;
    let target = head.peel_to_commit().map_err(GitError::from)?;
    let pathspecs: Vec<&str> = paths.iter().map(|s| s.as_str()).collect();
    repo.reset_default(Some(target.as_object()), pathspecs.iter())
        .map_err(GitError::from)?;
    Ok(())
}

/// Discard all working directory changes.
pub fn discard_all(repo: &Repository) -> Result<(), GitError> {
    let mut opts = git2::build::CheckoutBuilder::new();
    opts.force();
    repo.checkout_head(Some(&mut opts))
        .map_err(GitError::from)?;
    Ok(())
}

/// Classify a staged status flag and update the summary counter.
fn classify_staged(status: GitStatus, summary: &mut StatusSummary) -> &'static str {
    if status.contains(GitStatus::INDEX_NEW) {
        summary.new_count += 1;
        "new"
    } else if status.contains(GitStatus::INDEX_MODIFIED) {
        summary.modified += 1;
        "modified"
    } else if status.contains(GitStatus::INDEX_DELETED) {
        summary.deleted += 1;
        "deleted"
    } else if status.contains(GitStatus::INDEX_RENAMED) {
        summary.renamed += 1;
        "renamed"
    } else {
        "unknown"
    }
}

/// Classify an unstaged status flag and update the summary counter.
fn classify_unstaged(status: GitStatus, summary: &mut StatusSummary) -> &'static str {
    if status.contains(GitStatus::WT_NEW) {
        summary.new_count += 1;
        "new"
    } else if status.contains(GitStatus::WT_MODIFIED) {
        summary.modified += 1;
        "modified"
    } else if status.contains(GitStatus::WT_DELETED) {
        summary.deleted += 1;
        "deleted"
    } else if status.contains(GitStatus::WT_RENAMED) {
        summary.renamed += 1;
        "renamed"
    } else {
        "unknown"
    }
}
