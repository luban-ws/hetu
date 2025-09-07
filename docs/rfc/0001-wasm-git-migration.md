# 0001: WASM-Git Migration

**Status**: Accepted  
**Date**: 2025-09-06  
**Author**: Claude Code Assistant  

## Summary

Migration of MetroGit from NodeGit and isomorphic-git to a WASM-Git only implementation. This change eliminates native dependencies, simplifies the architecture, and provides a more consistent Git implementation across all platforms.

## Motivation

The existing implementation used a complex adapter system that supported multiple Git backends:
- NodeGit (native libgit2 bindings)
- isomorphic-git (pure JavaScript implementation)
- WASM-Git (WebAssembly libgit2)

This multi-backend approach caused several issues:

1. **Complexity**: Maintaining compatibility across three different Git implementations
2. **Native Dependencies**: NodeGit required native compilation, causing installation issues
3. **Inconsistent Behavior**: Different backends had varying levels of feature support
4. **Maintenance Burden**: Updates needed testing across all three implementations
5. **Bundle Size**: Shipping multiple Git implementations increased application size

## Detailed Design

### Architecture

The new architecture uses a single WASM-Git adapter with a NodeGit compatibility layer:

```
Application Code
       ↓
NodeGit Compatibility Layer (nodegit-compatibility.js)
       ↓
WASM-Git Adapter (wasm-git-adapter.js)
       ↓
WASM-Git Library (libgit2 WebAssembly)
```

### Implementation Details

#### 1. WASM-Git Adapter (`src/main/git/adapters/wasm-git-adapter.js`)

- Implements full Git functionality using WASM-Git
- Provides async/await API for all Git operations
- Handles file system operations, commits, branches, remotes, and more
- Includes robust error handling and logging

Key features implemented:
- Repository initialization and opening
- Commit creation, retrieval, and traversal
- Branch management (create, delete, checkout, merge)
- Remote operations (fetch, push, pull)
- Stash operations (save, pop, apply, drop, list)
- Status and diff operations
- Tag management
- Reset operations (soft, mixed, hard)
- File staging and unstaging

#### 2. Git Adapter Factory (`src/main/git/git-adapter-factory.js`)

- Simplified factory that creates only WASM-Git adapters
- Removed multi-backend detection logic
- Streamlined adapter creation process

#### 3. NodeGit Compatibility Layer (`src/main/git/nodegit-compatibility.js`)

- Provides NodeGit-compatible API surface
- Maps NodeGit method calls to WASM-Git operations
- Maintains backward compatibility for existing application code
- Includes pure functions for credentials, signatures, and operations

#### 4. Base Adapter Architecture (`src/main/git/adapters/base-git-adapter.js`)

- Abstract base class defining the Git adapter interface
- Provides common logging and error handling utilities
- Ensures consistent API across any future adapter implementations

### Files Modified

**Created:**
- `src/main/git/adapters/wasm-git-adapter.js` - New WASM-Git implementation
- `src/main/git/git-adapter-factory.js` - Simplified factory
- `src/main/git/nodegit-compatibility.js` - Compatibility layer
- `src/main/git/adapters/base-git-adapter.js` - Base adapter class

**Modified:**
- `src/main/git/file-watcher.js` - Updated imports to use compatibility layer
- `src/main/git/submodules.js` - Updated imports to use compatibility layer
- `src/main/git/repo.js` - Updated imports to use compatibility layer

**Removed:**
- `src/main/git/git-adapter-extended.js` - Multi-backend adapter
- `src/main/git/adapters/isomorphic-git-adapter.js` - isomorphic-git implementation
- `src/main/git/adapters/git-adapter.js` - Old adapter implementation
- `src/main/git/adapters/wasm-git-adapter.js` - Old WASM-Git implementation

## Alternatives Considered

### 1. Continue Multi-Backend Support
- **Pros**: Flexibility, fallback options
- **Cons**: Complexity, maintenance burden, inconsistent behavior
- **Rejected**: Maintenance costs outweighed benefits

### 2. Pure JavaScript Implementation (isomorphic-git)
- **Pros**: No native dependencies, smaller bundle
- **Cons**: Limited feature set, performance concerns
- **Rejected**: Missing critical Git features needed by MetroGit

### 3. NodeGit Only
- **Pros**: Full libgit2 feature set, mature
- **Cons**: Native compilation issues, platform dependencies
- **Rejected**: Installation and distribution problems

### 4. WASM-Git Only (Selected)
- **Pros**: Full libgit2 features, no native deps, consistent behavior
- **Cons**: Learning curve, newer technology
- **Selected**: Best balance of features, performance, and maintainability

## Migration Strategy

### Phase 1: Implementation ✅
- Create new WASM-Git adapter with full feature parity
- Implement NodeGit compatibility layer
- Update factory to use WASM-Git only

### Phase 2: Integration ✅
- Update existing Git modules to use compatibility layer
- Remove old adapter implementations
- Update imports throughout codebase

### Phase 3: Testing ✅
- Test all Git operations with new implementation
- Verify compatibility with existing application features
- Performance testing and optimization

### Phase 4: Cleanup ✅
- Remove unused dependencies from package.json
- Clean up old adapter files
- Update documentation

## Testing Strategy

The migration was tested through:

1. **Unit Testing**: Individual adapter methods tested in isolation
2. **Integration Testing**: End-to-end workflows tested with WASM-Git
3. **Compatibility Testing**: Verified existing application code works unchanged
4. **Performance Testing**: Ensured WASM-Git performance meets requirements
5. **Manual Testing**: Key workflows tested through the application UI

Critical test cases:
- Repository opening and initialization
- Commit creation and history traversal
- Branch operations (create, switch, merge, delete)
- Remote operations (clone, fetch, push, pull)
- File operations (stage, unstage, status, diff)
- Stash operations
- Tag management
- Reset operations

## Timeline

- **Planning**: 2025-09-05 - Architecture design and approach validation
- **Implementation**: 2025-09-06 - Core adapter and compatibility layer
- **Integration**: 2025-09-06 - Update existing modules and remove old code
- **Testing**: 2025-09-06 - Comprehensive testing and validation
- **Completion**: 2025-09-06 - Migration complete and documented

## Benefits Achieved

1. **Simplified Architecture**: Single Git backend reduces complexity
2. **Eliminated Native Dependencies**: No more NodeGit compilation issues
3. **Consistent Behavior**: Single libgit2 implementation across all platforms
4. **Reduced Bundle Size**: Removed redundant Git implementations
5. **Improved Maintainability**: Single code path to maintain and test
6. **Better Performance**: WASM-Git provides near-native performance
7. **Cross-Platform Compatibility**: Works consistently across all Electron platforms

## Technical Debt Resolved

- Removed complex multi-backend adapter system
- Eliminated NodeGit native dependency issues
- Simplified error handling across Git operations
- Reduced code duplication between adapters
- Streamlined testing requirements

## Open Questions

None. Migration is complete and operational.

## Status History

- **2025-09-06**: RFC created as Accepted (post-implementation documentation)
- **2025-09-06**: Implementation completed successfully