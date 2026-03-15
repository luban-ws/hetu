//! Remote operations: fetch, push with HTTPS and SSH credential support.

use git2::{CredentialType, Repository};

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
