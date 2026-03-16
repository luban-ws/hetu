//! Diff operations: generate unified diffs for files at specific commits.

use git2::{DiffOptions, Oid, Repository};
use serde::Serialize;

use super::error::GitError;

/// A single file's diff content returned to the frontend.
#[derive(Debug, Serialize, Clone)]
pub struct FileDiff {
    pub path: String,
    pub content: String,
    #[serde(rename = "oldContent")]
    pub old_content: String,
    pub patch: String,
    pub status: String,
}

/// Get the diff for a specific file at a given commit.
///
/// When `commit_sha` is empty, diffs the working tree against HEAD.
/// When `full_file` is true, returns the full file content instead of just the patch.
pub fn get_file_detail(
    repo: &Repository,
    file_path: &str,
    commit_sha: &str,
    full_file: bool,
) -> Result<FileDiff, GitError> {
    if commit_sha.is_empty() {
        return get_working_tree_diff(repo, file_path, full_file);
    }

    let oid = Oid::from_str(commit_sha).map_err(GitError::from)?;
    let commit = repo.find_commit(oid).map_err(GitError::from)?;
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

    let mut opts = DiffOptions::new();
    opts.pathspec(file_path);

    let diff = repo
        .diff_tree_to_tree(parent_tree.as_ref(), Some(&tree), Some(&mut opts))
        .map_err(GitError::from)?;

    let mut patch_text = String::new();
    diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
        let origin = line.origin();
        if origin == '+' || origin == '-' || origin == ' ' {
            patch_text.push(origin);
        }
        patch_text.push_str(std::str::from_utf8(line.content()).unwrap_or(""));
        true
    })
    .map_err(GitError::from)?;

    let content = if full_file {
        read_blob_at_tree(repo, &tree, file_path).unwrap_or_default()
    } else {
        String::new()
    };

    let old_content = if full_file {
        parent_tree
            .as_ref()
            .and_then(|t| read_blob_at_tree(repo, t, file_path).ok())
            .unwrap_or_default()
    } else {
        String::new()
    };

    let status = diff
        .deltas()
        .next()
        .map(|d| format!("{:?}", d.status()))
        .unwrap_or_else(|| "unknown".to_string())
        .to_lowercase();

    Ok(FileDiff {
        path: file_path.to_string(),
        content,
        old_content,
        patch: patch_text,
        status,
    })
}

/// Diff working tree against HEAD for a single file.
fn get_working_tree_diff(
    repo: &Repository,
    file_path: &str,
    full_file: bool,
) -> Result<FileDiff, GitError> {
    let head = repo.head().map_err(GitError::from)?;
    let tree = head
        .peel_to_tree()
        .map_err(GitError::from)?;

    let mut opts = DiffOptions::new();
    opts.pathspec(file_path);

    let diff = repo
        .diff_tree_to_workdir_with_index(Some(&tree), Some(&mut opts))
        .map_err(GitError::from)?;

    let mut patch_text = String::new();
    diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
        let origin = line.origin();
        if origin == '+' || origin == '-' || origin == ' ' {
            patch_text.push(origin);
        }
        patch_text.push_str(std::str::from_utf8(line.content()).unwrap_or(""));
        true
    })
    .map_err(GitError::from)?;

    let content = if full_file {
        let workdir = repo.workdir().ok_or_else(|| GitError {
            code: "NotFound".to_string(),
            message: "No working directory".to_string(),
        })?;
        std::fs::read_to_string(workdir.join(file_path)).unwrap_or_default()
    } else {
        String::new()
    };

    let old_content = if full_file {
        read_blob_at_tree(repo, &tree, file_path).unwrap_or_default()
    } else {
        String::new()
    };

    let status = diff
        .deltas()
        .next()
        .map(|d| format!("{:?}", d.status()))
        .unwrap_or_else(|| "unknown".to_string())
        .to_lowercase();

    Ok(FileDiff {
        path: file_path.to_string(),
        content,
        old_content,
        patch: patch_text,
        status,
    })
}

/// Read a blob's UTF-8 content from a tree by path.
fn read_blob_at_tree(
    repo: &Repository,
    tree: &git2::Tree,
    path: &str,
) -> Result<String, GitError> {
    let entry = tree.get_path(std::path::Path::new(path)).map_err(GitError::from)?;
    let blob = repo.find_blob(entry.id()).map_err(GitError::from)?;
    Ok(String::from_utf8_lossy(blob.content()).to_string())
}
