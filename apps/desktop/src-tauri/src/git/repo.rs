//! Repository management: open, close, init.

use git2::Repository;
use std::path::Path;

use super::error::GitError;

/// Open an existing git repository at the given path.
pub fn open(path: &str) -> Result<Repository, GitError> {
    Repository::discover(path).map_err(GitError::from)
}

/// Initialize a new git repository at the given path.
pub fn init(path: &str) -> Result<Repository, GitError> {
    Repository::init(path).map_err(GitError::from)
}

/// Extract repository name from its working directory.
pub fn repo_name(repo: &Repository) -> String {
    repo.workdir()
        .and_then(|p| p.file_name())
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string()
}

/// Get the working directory path of a repository.
pub fn working_dir(repo: &Repository) -> String {
    repo.workdir()
        .unwrap_or_else(|| Path::new(""))
        .to_string_lossy()
        .to_string()
}
