//! Stash operations.

use git2::Repository;

use super::error::GitError;

/// Save current changes to stash.
pub fn stash_save(
    repo: &mut Repository,
    name: &str,
    email: &str,
    message: &str,
) -> Result<(), GitError> {
    let sig = git2::Signature::now(name, email).map_err(GitError::from)?;
    repo.stash_save(&sig, message, None)
        .map_err(GitError::from)?;
    Ok(())
}

/// Pop the latest stash or stash at given index.
pub fn stash_pop(repo: &mut Repository, index: usize) -> Result<(), GitError> {
    repo.stash_pop(index, None).map_err(GitError::from)?;
    Ok(())
}

/// Apply a stash without removing it.
pub fn stash_apply(repo: &mut Repository, index: usize) -> Result<(), GitError> {
    repo.stash_apply(index, None).map_err(GitError::from)?;
    Ok(())
}

/// Drop (delete) a stash entry.
pub fn stash_drop(repo: &mut Repository, index: usize) -> Result<(), GitError> {
    repo.stash_drop(index).map_err(GitError::from)?;
    Ok(())
}
