//! Tauri app library entry: setup and command registration.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
pub mod appveyor;
pub mod git;
pub mod jira;
pub mod repo_history;
pub mod secure;
pub mod settings_store;
pub mod state;

/// Build and run the Tauri application.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(state::AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::ping::ping,
            commands::app_version::get_app_version,
            // Repo lifecycle
            commands::repo_open::repo_open,
            commands::repo_open::repo_init,
            commands::repo_close::repo_close,
            commands::repo_status::repo_get_status,
            // Commits
            commands::repo_commits::repo_get_commits,
            commands::repo_commits::repo_get_commit,
            commands::repo_commit::repo_commit,
            commands::repo_commit::repo_commit_staged,
            // Stage / unstage / discard
            commands::repo_stage::repo_stage,
            commands::repo_stage::repo_unstage,
            commands::repo_stage::repo_stage_lines,
            commands::repo_stage::repo_unstage_lines,
            commands::repo_stage::repo_discard_all,
            // Branches
            commands::repo_branch::repo_create_branch,
            commands::repo_branch::repo_checkout,
            commands::repo_branch::repo_delete_branch,
            // Remote: fetch, pull, push, push-tag
            commands::repo_remote::repo_fetch,
            commands::repo_remote::repo_pull,
            commands::repo_remote::repo_push,
            commands::repo_remote::repo_push_tag,
            // Stash
            commands::repo_stash::repo_stash_save,
            commands::repo_stash::repo_stash_pop,
            commands::repo_stash::repo_stash_apply,
            commands::repo_stash::repo_stash_drop,
            // Tags
            commands::repo_tag::repo_create_tag,
            commands::repo_tag::repo_delete_tag,
            // Reset
            commands::repo_reset::repo_reset,
            // File detail / diff
            commands::repo_file::repo_get_file_detail,
            // Security
            commands::secure::secure_get_password,
            commands::secure::secure_set_password,
            commands::secure::secure_delete_password,
            commands::secure::secure_clear_cache,
            // Settings
            commands::settings::settings_init,
            commands::settings::settings_get,
            commands::settings::settings_set,
            commands::settings::settings_get_repo,
            commands::settings::settings_set_repo,
            commands::settings::settings_get_all,
            commands::settings::settings_get_all_repo,
            commands::settings::settings_get_secure_repo,
            commands::settings::settings_set_secure_repo,
            // Credentials
            commands::credentials::set_credentials,
            commands::credentials::get_stored_credentials,
            // JIRA
            commands::jira::jira_repo_changed,
            commands::jira::jira_get_issue,
            commands::jira::jira_add_comment,
            commands::jira::jira_update_issue,
            commands::jira::jira_assign_issue,
            commands::jira::jira_get_assignable_users,
            commands::jira::jira_add_subtask,
            commands::jira::jira_search_issues,
            // AppVeyor CI
            commands::appveyor::ci_repo_changed,
            commands::appveyor::ci_appveyor_rebuild,
            commands::appveyor::ci_appveyor_get_log,
            // Browse / history
            commands::repo_browse::repo_browse,
            commands::repo_browse::repo_init_browse,
            commands::repo_browse::settings_browse_file,
            commands::repo_browse::repo_get_history,
            commands::repo_browse::repo_remove_history,
            // Auto-fetch timer
            commands::auto_fetch::auto_fetch_start,
            commands::auto_fetch::auto_fetch_stop,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
