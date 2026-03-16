//! Integration tests for the git module.

use hetu_lib::git;
use std::fs;
use std::path::Path;
use tempfile::TempDir;

/// Create a temporary git repo with an initial commit.
fn scaffold_repo() -> (TempDir, git2::Repository) {
    let dir = TempDir::new().expect("failed to create temp dir");
    let repo = git2::Repository::init(dir.path()).expect("failed to init repo");

    let sig = git2::Signature::now("Test User", "test@example.com").unwrap();
    let tree_oid = {
        let mut index = repo.index().unwrap();
        let readme = dir.path().join("README.md");
        fs::write(&readme, "# hello").unwrap();
        index.add_path(Path::new("README.md")).unwrap();
        index.write().unwrap();
        index.write_tree().unwrap()
    };

    {
        let tree = repo.find_tree(tree_oid).unwrap();
        repo.commit(Some("HEAD"), &sig, &sig, "initial commit", &tree, &[])
            .unwrap();
    }

    (dir, repo)
}

/// Append content to a file and stage it.
fn write_and_stage(repo: &git2::Repository, dir: &Path, name: &str, content: &str) {
    fs::write(dir.join(name), content).unwrap();
    let mut index = repo.index().unwrap();
    index.add_path(Path::new(name)).unwrap();
    index.write().unwrap();
}

// ─── repo module ────────────────────────────────────────────────

#[test]
fn repo_open_and_name() {
    let (dir, _repo) = scaffold_repo();
    let opened = git::repo::open(dir.path().to_str().unwrap()).expect("open failed");
    let name = git::repo::repo_name(&opened);
    assert!(!name.is_empty());
    assert_ne!(name, "unknown");
}

#[test]
fn repo_init_creates_new() {
    let dir = TempDir::new().unwrap();
    let sub = dir.path().join("newrepo");
    fs::create_dir_all(&sub).unwrap();
    let repo = git::repo::init(sub.to_str().unwrap()).expect("init failed");
    assert!(repo.is_empty().unwrap());
}

#[test]
fn repo_working_dir_matches() {
    let (dir, repo) = scaffold_repo();
    let wd = git::repo::working_dir(&repo);
    assert_eq!(
        Path::new(&wd).canonicalize().unwrap(),
        dir.path().canonicalize().unwrap()
    );
}

// ─── status module ──────────────────────────────────────────────

#[test]
fn status_clean_repo() {
    let (_dir, repo) = scaffold_repo();
    let st = git::status::get_status(&repo).expect("get_status failed");
    assert!(st.staged.is_empty());
    assert!(st.unstaged.is_empty());
}

#[test]
fn status_detects_unstaged_new_file() {
    let (dir, repo) = scaffold_repo();
    fs::write(dir.path().join("new.txt"), "content").unwrap();

    let st = git::status::get_status(&repo).expect("get_status failed");
    assert!(!st.unstaged.is_empty(), "should have unstaged files");
    assert_eq!(st.unstaged[0].path, "new.txt");
    assert_eq!(st.unstaged[0].status, "new");
    assert_eq!(st.unstaged_summary.new_count, 1);
}

#[test]
fn stage_and_unstage() {
    let (dir, repo) = scaffold_repo();
    fs::write(dir.path().join("file.txt"), "data").unwrap();

    git::status::stage(&repo, &["file.txt".to_string()]).expect("stage failed");

    let st = git::status::get_status(&repo).unwrap();
    assert!(!st.staged.is_empty(), "file should be staged");

    git::status::unstage(&repo, &["file.txt".to_string()]).expect("unstage failed");

    let st2 = git::status::get_status(&repo).unwrap();
    assert!(st2.staged.is_empty(), "staged should be empty after unstage");
}

#[test]
fn discard_all_reverts_changes() {
    let (dir, repo) = scaffold_repo();
    fs::write(dir.path().join("README.md"), "overwritten").unwrap();

    let st = git::status::get_status(&repo).unwrap();
    assert!(!st.unstaged.is_empty());

    git::status::discard_all(&repo).expect("discard_all failed");

    let content = fs::read_to_string(dir.path().join("README.md")).unwrap();
    assert_eq!(content, "# hello");
}

// ─── commit module ──────────────────────────────────────────────

#[test]
fn create_and_get_commits() {
    let (dir, repo) = scaffold_repo();
    write_and_stage(&repo, dir.path(), "file.txt", "data");

    let sha =
        git::commit::create_commit(&repo, "second commit", "Tester", "t@t.com").expect("commit");
    assert!(!sha.is_empty());

    let commits = git::commit::get_commits(&repo, 10).expect("get_commits failed");
    assert_eq!(commits.len(), 2);
    assert_eq!(commits[0].sha, sha);
    assert_eq!(commits[0].message, "second commit");
    assert_eq!(commits[0].author, "Tester");
}

#[test]
fn get_single_commit() {
    let (_dir, repo) = scaffold_repo();
    let commits = git::commit::get_commits(&repo, 1).unwrap();
    let sha = &commits[0].sha;
    let detail = git::commit::get_commit(&repo, sha).expect("get_commit failed");
    assert_eq!(&detail.info.sha, sha);
    assert_eq!(detail.info.message, "initial commit");
}

#[test]
fn max_count_limits_output() {
    let (dir, repo) = scaffold_repo();
    for i in 0..5 {
        write_and_stage(&repo, dir.path(), &format!("f{i}.txt"), "data");
        git::commit::create_commit(&repo, &format!("commit {i}"), "T", "t@t.com").unwrap();
    }
    let all = git::commit::get_commits(&repo, 100).unwrap();
    assert_eq!(all.len(), 6); // initial + 5

    let limited = git::commit::get_commits(&repo, 3).unwrap();
    assert_eq!(limited.len(), 3);
}

// ─── branch module ──────────────────────────────────────────────

#[test]
fn current_branch_is_main_or_master() {
    let (_dir, repo) = scaffold_repo();
    let info = git::branch::current_branch(&repo).expect("current_branch failed");
    assert!(
        info.name == "main" || info.name == "master",
        "expected main or master, got: {}",
        info.name
    );
    assert!(info.is_branch);
}

#[test]
fn create_and_checkout_branch() {
    let (_dir, repo) = scaffold_repo();
    let head_sha = repo.head().unwrap().target().unwrap().to_string();

    git::branch::create_branch(&repo, "feature-x", &head_sha).expect("create_branch failed");

    let info = git::branch::checkout(&repo, "feature-x").expect("checkout failed");
    assert_eq!(info.name, "feature-x");
}

#[test]
fn delete_branch() {
    let (dir, repo) = scaffold_repo();
    let head_sha = repo.head().unwrap().target().unwrap().to_string();

    git::branch::create_branch(&repo, "to-delete", &head_sha).unwrap();

    // must be on a different branch to delete
    write_and_stage(&repo, dir.path(), "x.txt", "x");
    git::commit::create_commit(&repo, "commit on default", "T", "t@t.com").unwrap();

    let result = git::branch::delete_branch(&repo, "to-delete").expect("delete_branch failed");
    assert!(result.is_none(), "no upstream expected");
}

#[test]
fn get_references_includes_branches() {
    let (_dir, repo) = scaffold_repo();
    let (refs, ref_dict) = git::branch::get_references(&repo).expect("get_references failed");
    assert!(!refs.is_empty(), "should have at least one reference");
    assert!(ref_dict.is_object());
}

// ─── tag module ─────────────────────────────────────────────────

#[test]
fn create_and_delete_tag() {
    let (_dir, repo) = scaffold_repo();
    let head_sha = repo.head().unwrap().target().unwrap().to_string();

    git::tag::create_tag(&repo, "v0.1.0", &head_sha).expect("create_tag failed");

    let (refs, _) = git::branch::get_references(&repo).unwrap();
    let has_tag = refs.iter().any(|r| r.name == "v0.1.0" && r.is_tag);
    assert!(has_tag, "tag should appear in references");

    git::tag::delete_tag(&repo, "v0.1.0").expect("delete_tag failed");
}

// ─── stash module ───────────────────────────────────────────────

#[test]
fn stash_save_and_pop() {
    let (dir, mut repo) = scaffold_repo();
    fs::write(dir.path().join("README.md"), "modified for stash").unwrap();

    git::stash::stash_save(&mut repo, "Tester", "t@t.com", "wip stash")
        .expect("stash_save failed");

    let content = fs::read_to_string(dir.path().join("README.md")).unwrap();
    assert_eq!(content, "# hello", "stash should revert working dir");

    git::stash::stash_pop(&mut repo, 0).expect("stash_pop failed");

    let content = fs::read_to_string(dir.path().join("README.md")).unwrap();
    assert_eq!(content, "modified for stash", "pop should restore changes");
}

#[test]
fn stash_apply_keeps_stash() {
    let (dir, mut repo) = scaffold_repo();
    fs::write(dir.path().join("README.md"), "for apply").unwrap();

    git::stash::stash_save(&mut repo, "Tester", "t@t.com", "apply stash").unwrap();
    git::stash::stash_apply(&mut repo, 0).expect("stash_apply failed");

    let content = fs::read_to_string(dir.path().join("README.md")).unwrap();
    assert_eq!(content, "for apply");

    // stash should still exist (can drop it)
    git::stash::stash_drop(&mut repo, 0).expect("stash_drop should succeed");
}

// ─── reset module ───────────────────────────────────────────────

#[test]
fn reset_hard_discards_commit() {
    let (dir, repo) = scaffold_repo();
    let initial_sha = repo.head().unwrap().target().unwrap().to_string();

    write_and_stage(&repo, dir.path(), "extra.txt", "data");
    git::commit::create_commit(&repo, "to be reset", "T", "t@t.com").unwrap();

    git::reset::reset_hard(&repo, Some(&initial_sha)).expect("reset_hard failed");

    let commits = git::commit::get_commits(&repo, 10).unwrap();
    assert_eq!(commits.len(), 1);
    assert!(!dir.path().join("extra.txt").exists());
}

#[test]
fn reset_soft_keeps_changes_staged() {
    let (dir, repo) = scaffold_repo();
    let initial_sha = repo.head().unwrap().target().unwrap().to_string();

    write_and_stage(&repo, dir.path(), "keep.txt", "keep");
    git::commit::create_commit(&repo, "soft target", "T", "t@t.com").unwrap();

    git::reset::reset_soft(&repo, Some(&initial_sha)).expect("reset_soft failed");

    let commits = git::commit::get_commits(&repo, 10).unwrap();
    assert_eq!(commits.len(), 1, "commit should be unwound");
    assert!(dir.path().join("keep.txt").exists(), "file should remain");

    let st = git::status::get_status(&repo).unwrap();
    assert!(!st.staged.is_empty(), "changes should be staged after soft reset");
}

// ─── error module ───────────────────────────────────────────────

#[test]
fn error_display_format() {
    let err = git::error::GitError {
        code: "NotFound".to_string(),
        message: "ref not found".to_string(),
    };
    let display = format!("{err}");
    assert_eq!(display, "[NotFound] ref not found");
}

#[test]
fn error_from_git2() {
    let git_err: git::error::GitError = match git2::Repository::open("/nonexistent/path/12345") {
        Err(e) => git::error::GitError::from(e),
        Ok(_) => panic!("should have failed"),
    };
    assert!(!git_err.message.is_empty());
    assert!(!git_err.code.is_empty());
}
