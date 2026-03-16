//! Remote operations: fetch, pull (fetch+merge), push, push-tag
//! with HTTPS and SSH credential support.

use git2::{AnnotatedCommit, CredentialType, Repository};

use super::error::GitError;

/// Credential bundle for remote operations.
#[derive(Debug, Clone, Default)]
pub struct RemoteCreds {
    pub username: Option<String>,
    pub password: Option<String>,
    pub ssh_key_path: Option<String>,
    pub ssh_pub_path: Option<String>,
    pub ssh_passphrase: Option<String>,
}

/// Build a `RemoteCallbacks` that handles both HTTPS userpass and SSH key auth.
fn build_callbacks(creds: &RemoteCreds) -> git2::RemoteCallbacks<'_> {
    let creds = creds.clone();
    let mut callbacks = git2::RemoteCallbacks::new();

    callbacks.credentials(move |_url, username_from_url, allowed| {
        if allowed.contains(CredentialType::SSH_KEY) {
            if let Some(ref key_path) = creds.ssh_key_path {
                let pub_path = creds.ssh_pub_path.as_deref();
                let passphrase = creds.ssh_passphrase.as_deref();
                let user = username_from_url.unwrap_or("git");
                return git2::Cred::ssh_key(
                    user,
                    pub_path.map(std::path::Path::new),
                    std::path::Path::new(key_path),
                    passphrase,
                );
            }
        }

        if allowed.contains(CredentialType::USER_PASS_PLAINTEXT) {
            if let (Some(ref user), Some(ref pass)) = (&creds.username, &creds.password) {
                return git2::Cred::userpass_plaintext(user, pass);
            }
        }

        if allowed.contains(CredentialType::DEFAULT) {
            return git2::Cred::default();
        }

        Err(git2::Error::from_str("no credentials available"))
    });

    callbacks
}

/// Fetch from the default remote.
pub fn fetch(repo: &Repository, creds: &RemoteCreds) -> Result<(), GitError> {
    let remotes = repo.remotes().map_err(GitError::from)?;
    let remote_name = remotes.get(0).unwrap_or("origin");
    let mut remote = repo.find_remote(remote_name).map_err(GitError::from)?;

    let callbacks = build_callbacks(creds);
    let mut fetch_opts = git2::FetchOptions::new();
    fetch_opts.remote_callbacks(callbacks);

    remote
        .fetch::<String>(&[], Some(&mut fetch_opts), None)
        .map_err(GitError::from)?;
    Ok(())
}

/// Pull from the default remote: fetch then fast-forward merge.
pub fn pull(repo: &Repository, creds: &RemoteCreds) -> Result<(), GitError> {
    let remotes = repo.remotes().map_err(GitError::from)?;
    let remote_name = remotes.get(0).unwrap_or("origin");

    // Resolve the tracking branch for the current HEAD
    let head = repo.head().map_err(GitError::from)?;
    let local_branch = git2::Branch::wrap(head);
    let branch_name = local_branch
        .name()
        .map_err(GitError::from)?
        .unwrap_or("main")
        .to_string();

    // Fetch first
    fetch(repo, creds)?;

    // Find the FETCH_HEAD annotated commit
    let fetch_head = repo.find_reference("FETCH_HEAD").map_err(GitError::from)?;
    let annotated: AnnotatedCommit<'_> =
        repo.reference_to_annotated_commit(&fetch_head).map_err(GitError::from)?;

    let (analysis, _) = repo.merge_analysis(&[&annotated]).map_err(GitError::from)?;

    if analysis.is_up_to_date() {
        return Ok(());
    }

    if analysis.is_fast_forward() {
        let refname = format!("refs/heads/{}", branch_name);
        let mut reference = repo.find_reference(&refname).map_err(GitError::from)?;
        reference
            .set_target(annotated.id(), "pull: fast-forward")
            .map_err(GitError::from)?;
        repo.set_head(&refname).map_err(GitError::from)?;
        repo.checkout_head(Some(git2::build::CheckoutBuilder::default().force()))
            .map_err(GitError::from)?;
        return Ok(());
    }

    // Normal merge (non-fast-forward)
    repo.merge(&[&annotated], None, None)
        .map_err(GitError::from)?;

    if repo.index().map_err(GitError::from)?.has_conflicts() {
        return Err(GitError {
            code: "Conflict".to_string(),
            message: format!(
                "Merge conflicts detected when pulling {}/{}",
                remote_name, branch_name
            ),
        });
    }

    // Auto-commit the merge
    let sig = repo.signature().map_err(GitError::from)?;
    let mut index = repo.index().map_err(GitError::from)?;
    let tree_oid = index.write_tree().map_err(GitError::from)?;
    let tree = repo.find_tree(tree_oid).map_err(GitError::from)?;
    let head_commit = repo
        .head()
        .map_err(GitError::from)?
        .peel_to_commit()
        .map_err(GitError::from)?;
    let remote_commit = repo
        .find_commit(annotated.id())
        .map_err(GitError::from)?;
    let msg = format!("Merge branch '{}' of {}", branch_name, remote_name);
    repo.commit(
        Some("HEAD"),
        &sig,
        &sig,
        &msg,
        &tree,
        &[&head_commit, &remote_commit],
    )
    .map_err(GitError::from)?;
    repo.cleanup_state().map_err(GitError::from)?;

    Ok(())
}

/// Push to the default remote.
pub fn push(repo: &Repository, creds: &RemoteCreds, force: bool) -> Result<(), GitError> {
    let head = repo.head().map_err(GitError::from)?;
    let refspec = head.name().unwrap_or("refs/heads/main");
    let push_refspec = if force {
        format!("+{refspec}:{refspec}")
    } else {
        format!("{refspec}:{refspec}")
    };

    let remotes = repo.remotes().map_err(GitError::from)?;
    let remote_name = remotes.get(0).unwrap_or("origin");
    let mut remote = repo.find_remote(remote_name).map_err(GitError::from)?;

    let callbacks = build_callbacks(creds);
    let mut push_opts = git2::PushOptions::new();
    push_opts.remote_callbacks(callbacks);

    remote
        .push(&[push_refspec], Some(&mut push_opts))
        .map_err(GitError::from)?;
    Ok(())
}

/// Push a specific tag to the default remote.
pub fn push_tag(repo: &Repository, creds: &RemoteCreds, tag_name: &str) -> Result<(), GitError> {
    let refspec = format!("refs/tags/{tag_name}:refs/tags/{tag_name}");

    let remotes = repo.remotes().map_err(GitError::from)?;
    let remote_name = remotes.get(0).unwrap_or("origin");
    let mut remote = repo.find_remote(remote_name).map_err(GitError::from)?;

    let callbacks = build_callbacks(creds);
    let mut push_opts = git2::PushOptions::new();
    push_opts.remote_callbacks(callbacks);

    remote
        .push(&[refspec], Some(&mut push_opts))
        .map_err(GitError::from)?;
    Ok(())
}
