//! Git error types for mapping git2::Error to serializable output.

use serde::Serialize;

/// Serializable Git error sent to the frontend.
#[derive(Debug, Serialize, Clone)]
pub struct GitError {
    pub code: String,
    pub message: String,
}

impl From<git2::Error> for GitError {
    fn from(e: git2::Error) -> Self {
        Self {
            code: format!("{:?}", e.code()),
            message: e.message().to_string(),
        }
    }
}

impl std::fmt::Display for GitError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}] {}", self.code, self.message)
    }
}

impl std::error::Error for GitError {}
