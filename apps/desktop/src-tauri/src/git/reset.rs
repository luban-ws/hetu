//! Reset operations.

use git2::{Oid, Repository, ResetType};

use super::error::GitError;

/// Hard reset to a given commit (or HEAD if not specified).
pub fn reset_hard(repo: &Repository, commit_sha: Option<&str>) -> Result<(), GitError> {
    let obj = resolve_target(repo, commit_sha)?;
    repo.reset(&obj, ResetType::Hard, None)
        .map_err(GitError::from)?;
    Ok(())
}

/// Soft reset to a given commit.
pub fn reset_soft(repo: &Repository, commit_sha: Option<&str>) -> Result<(), GitError> {
    let obj = resolve_target(repo, commit_sha)?;
    repo.reset(&obj, ResetType::Soft, None)
        .map_err(GitError::from)?;
    Ok(())
}

/// Resolve a commit SHA (or HEAD) into a git2 Object.
fn resolve_target<'a>(
    repo: &'a Repository,
    commit_sha: Option<&str>,
) -> Result<git2::Object<'a>, GitError> {
    match commit_sha {
        Some(sha) => {
            let oid = Oid::from_str(sha).map_err(GitError::from)?;
            repo.find_object(oid, None).map_err(GitError::from)
        }
        None => {
            let head = repo.head().map_err(GitError::from)?;
            let commit = head.peel_to_commit().map_err(GitError::from)?;
            Ok(commit.into_object())
        }
    }
}
