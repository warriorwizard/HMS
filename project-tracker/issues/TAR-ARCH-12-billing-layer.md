# TAR-ARCH-12 - Billing Layer

Status: Later
Type: Architecture Module Issue
Epic: `TAR-EPIC-12` Billing Layer
Priority: P2
Source: `../../docs/tarini-v6-architecture/12_BILLING_LAYER.md`

## Goal
Add billing intelligence for services, invoices, line items, payments, adjustments, billing status, and workflow integration.

## Functional Scope
- Service catalog and pricing records.
- Invoice, line item, payment, and adjustment tables.
- Invoice creation and totals calculation.
- Payment recording.
- Billing status integration with visit and workflow.
- Billing desk UI.

## Backing Tasks
- [ ] `TAR-P10-001` Create service catalog, invoice, line item, payment, adjustment tables.
- [ ] `TAR-P10-002` Implement service catalog APIs.
- [ ] `TAR-P10-003` Implement invoice creation API.
- [ ] `TAR-P10-004` Implement invoice totals calculation service.
- [ ] `TAR-P10-005` Implement payment recording API.
- [ ] `TAR-P10-006` Integrate billing status with workflow.
- [ ] `TAR-P10-007` Build billing desk UI.
- [ ] `TAR-P10-008` Add billing permission and totals tests.

## Implementation Notes
- Billing is operational, but it still touches patient and visit data, so tenant isolation matters.
- Money calculations should use decimal-safe storage and deterministic totals.
- Adjustments require audit logs and reason fields.
- Billing should update workflow without blocking clinical safety actions.

## Acceptance Checks
- Staff can create an invoice from a visit or service catalog.
- Totals are deterministic and test-covered.
- Payments update invoice state.
- Billing permissions prevent unauthorized edits.
- Workflow can reflect unpaid, paid, waived, and adjusted billing states.

## LLM Handoff
```text
Read 12_BILLING_LAYER.md and BACKLOG.md Phase 10. Implement billing after patient and visit flows exist. Use decimal-safe calculations and audit all adjustments.
```
