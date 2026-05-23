# TAR-ARCH-16 - Database and Data Contracts

Status: In Progress
Type: Architecture Module Issue
Epic: `TAR-EPIC-16` Database and Data Contracts
Priority: P0
Source: `../../docs/tarini-v6-architecture/16_DATABASE_AND_DATA_CONTRACTS.md`

## Goal
Standardize IDs, tenant indexing, migrations, events, API errors, pagination, audit events, data quality fields, retention, and deletion behavior.

## Functional Scope
- Shared database principles and naming.
- Tenant-scoped indexing patterns.
- Event envelope contract.
- API error contract.
- Paginated response contract.
- Audit event contract.
- Migration strategy and retention policy.

## Backing Tasks
- [x] `TAR-P0-007` Add database migration tooling.
- [x] `TAR-P1-001` Design identity foundation tables.
- [ ] `TAR-ARCH-16-A` Define shared API error schema.
- [ ] `TAR-ARCH-16-B` Define shared pagination schema.
- [ ] `TAR-ARCH-16-C` Define event envelope schema.
- [ ] `TAR-ARCH-16-D` Define audit event schema.
- [ ] `TAR-ARCH-16-E` Add module migration checklist.
- [ ] `TAR-ARCH-16-F` Add retention and deletion policy notes.

## Implementation Notes
- Every tenant-owned table should include tenant-aware indexes.
- Events should carry source, correlation ID, tenant ID, actor, and occurred-at fields.
- API errors should be structured enough for frontend handling.
- Retention and deletion require compliance review before production.

## Acceptance Checks
- Shared contracts are documented and reused by module tasks.
- New tables follow ID, timestamp, tenant, and audit conventions.
- Event-producing modules use the same envelope.
- API errors are predictable for frontend and tests.
- Retention policy is documented before pilot.

## LLM Handoff
```text
Read 16_DATABASE_AND_DATA_CONTRACTS.md. Apply these contracts before adding module tables or APIs. Keep migrations reversible where practical and tenant indexes explicit.
```
