# RFC (Request for Comments)

This directory contains RFCs for the MetroGit project. RFCs are design documents that describe new features, architectural changes, and technical decisions.

## Template

Use the following template for new RFCs:

```markdown
# XXXX: Title

**Status**: [Draft|Active|Accepted|Rejected|Superseded]  
**Date**: YYYY-MM-DD  
**Author**: Author Name  

## Summary

Brief description of the proposed change.

## Motivation

Why is this change needed? What problem does it solve?

## Detailed Design

Technical details of the implementation.

### Architecture

High-level architectural overview.

### Implementation Details

Specific implementation details.

## Alternatives Considered

What other approaches were considered and why were they rejected?

## Migration Strategy

How will existing code/users be migrated to the new approach?

## Testing Strategy

How will this change be tested?

## Timeline

Key milestones and estimated completion dates.

## Open Questions

Unresolved questions that need discussion.
```

## Numbering Convention

RFCs are numbered sequentially starting from 0001. Use the next available number when creating a new RFC.

## Process

1. Create a new RFC file following the template
2. Submit for review and discussion
3. Update based on feedback
4. Mark as Accepted when implementation begins
5. Update status to Active during implementation
6. Archive when complete

## Current RFCs

- [0001: WASM-Git Migration](./0001-wasm-git-migration.md) - Migration from NodeGit to WASM-Git