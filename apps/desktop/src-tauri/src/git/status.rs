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

/// Stage specific lines of a file by applying a partial patch to the index.
///
/// `lines` contains line numbers (1-based) from the working-tree diff to stage.
pub fn stage_lines(repo: &Repository, path: &str, lines: &[usize]) -> Result<(), GitError> {
    let workdir = repo.workdir().ok_or_else(|| GitError {
        code: "NotFound".to_string(),
        message: "No working directory".to_string(),
    })?;
    let full_path = workdir.join(path);
    let current = std::fs::read_to_string(&full_path).map_err(|e| GitError {
        code: "IO".to_string(),
        message: e.to_string(),
    })?;

    let all_lines: Vec<&str> = current.lines().collect();
    let line_set: std::collections::HashSet<usize> =
        lines.iter().copied().collect();

    // Build content with only selected lines changed vs HEAD
    let head_content = head_file_content(repo, path).unwrap_or_default();
    let head_lines: Vec<&str> = head_content.lines().collect();

    // Write the selected-lines version to the index
    let mut index = repo.index().map_err(GitError::from)?;
    let mut staged_content = String::new();
    let max_len = all_lines.len().max(head_lines.len());
    for i in 0..max_len {
        let line_num = i + 1;
        if line_set.contains(&line_num) {
            if i < all_lines.len() {
                staged_content.push_str(all_lines[i]);
                staged_content.push('\n');
            }
        } else if i < head_lines.len() {
            staged_content.push_str(head_lines[i]);
            staged_content.push('\n');
        }
    }

    let oid = repo
        .blob(staged_content.as_bytes())
        .map_err(GitError::from)?;

    let file_mode = 0o100644;
    let mut entry = git2::IndexEntry {
        ctime: git2::IndexTime::new(0, 0),
        mtime: git2::IndexTime::new(0, 0),
        dev: 0,
        ino: 0,
        mode: file_mode,
        uid: 0,
        gid: 0,
        file_size: staged_content.len() as u32,
        id: oid,
        flags: 0,
        flags_extended: 0,
        path: path.as_bytes().to_vec(),
    };

    index.add(&entry).map_err(GitError::from)?;
    index.write().map_err(GitError::from)?;
    let _ = &mut entry; // suppress unused warning
    Ok(())
}

/// Unstage specific lines (restore them in the index to HEAD version).
pub fn unstage_lines(repo: &Repository, path: &str, lines: &[usize]) -> Result<(), GitError> {
    let head_content = head_file_content(repo, path).unwrap_or_default();
    let head_lines: Vec<&str> = head_content.lines().collect();

    // Read current index content
    let index_content = index_file_content(repo, path).unwrap_or_default();
    let idx_lines: Vec<&str> = index_content.lines().collect();

    let line_set: std::collections::HashSet<usize> = lines.iter().copied().collect();

    let mut result = String::new();
    let max_len = idx_lines.len().max(head_lines.len());
    for i in 0..max_len {
        let line_num = i + 1;
        if line_set.contains(&line_num) {
            // Restore this line from HEAD
            if i < head_lines.len() {
                result.push_str(head_lines[i]);
                result.push('\n');
            }
        } else if i < idx_lines.len() {
            result.push_str(idx_lines[i]);
            result.push('\n');
        }
    }

    let oid = repo.blob(result.as_bytes()).map_err(GitError::from)?;
    let mut index = repo.index().map_err(GitError::from)?;
    let entry = git2::IndexEntry {
        ctime: git2::IndexTime::new(0, 0),
        mtime: git2::IndexTime::new(0, 0),
        dev: 0,
        ino: 0,
        mode: 0o100644,
        uid: 0,
        gid: 0,
        file_size: result.len() as u32,
        id: oid,
        flags: 0,
        flags_extended: 0,
        path: path.as_bytes().to_vec(),
    };
    index.add(&entry).map_err(GitError::from)?;
    index.write().map_err(GitError::from)?;
    Ok(())
}

/// Read a file's content from the HEAD tree.
fn head_file_content(repo: &Repository, path: &str) -> Result<String, GitError> {
    let head = repo.head().map_err(GitError::from)?;
    let tree = head.peel_to_tree().map_err(GitError::from)?;
    let entry = tree
        .get_path(std::path::Path::new(path))
        .map_err(GitError::from)?;
    let blob = repo.find_blob(entry.id()).map_err(GitError::from)?;
    Ok(String::from_utf8_lossy(blob.content()).to_string())
}

/// Read a file's content from the current index.
fn index_file_content(repo: &Repository, path: &str) -> Result<String, GitError> {
    let index = repo.index().map_err(GitError::from)?;
    let entry = index.get_path(std::path::Path::new(path), 0).ok_or_else(|| GitError {
        code: "NotFound".to_string(),
        message: format!("File {} not in index", path),
    })?;
    let blob = repo.find_blob(entry.id).map_err(GitError::from)?;
    Ok(String::from_utf8_lossy(blob.content()).to_string())
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
