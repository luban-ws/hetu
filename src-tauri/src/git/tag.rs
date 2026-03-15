//! Tag operations.

use git2::{Oid, Repository};

use super::error::GitError;

/// Create a lightweight tag at the given commit.
pub fn create_tag(repo: &Repository, name: &str, target_sha: &str) -> Result<(), GitError> {
    let oid = Oid::from_str(target_sha).map_err(GitError::from)?;
    let obj = repo.find_object(oid, None).map_err(GitError::from)?;
    repo.tag_lightweight(name, &obj, false)
        .map_err(GitError::from)?;
    Ok(())
}

/// Delete a tag by name.
pub fn delete_tag(repo: &Repository, name: &str) -> Result<(), GitError> {
    repo.tag_delete(name).map_err(GitError::from)?;
    Ok(())
}
