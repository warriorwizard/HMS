# Billing Layer Architecture

## Product Purpose
The Billing Layer supports visit charges, invoices, payments, adjustments, and revenue workflow visibility. It should be good enough for diagnostic and hospital workflows without becoming a full accounting system in the first release.

Billing must integrate with registration and workflow because payment status often controls upload, processing, report release, or follow-up.

## Users
- Staff: creates invoices and records payments.
- Hospital Admin: configures price lists and reviews revenue.
- Doctor: may view billing state but should not manage payments by default.
- Patient: may view invoice and payment state if portal is enabled.
- B2B Partner: may receive partner invoices or credit workflows.

## In Scope
- Service catalog.
- Visit invoice.
- Line items.
- Discounts and adjustments.
- Payment recording.
- Invoice status.
- Credit or partner billing.
- Billing audit trail.
- Basic revenue analytics.

## Out of Scope for MVP
- Full insurance claim adjudication.
- Tax filing.
- General ledger.
- Complex payer contracts.
- Automated coding recommendations unless validated.

## Core Entities
`service_catalog_items`:
- `id`
- `tenant_id`
- `code`
- `name`
- `category`
- `default_price`
- `tax_rate`
- `active`
- `created_at`

`invoices`:
- `id`
- `tenant_id`
- `patient_id`
- `visit_id`
- `invoice_number`
- `status`
- `subtotal`
- `discount_total`
- `tax_total`
- `total`
- `balance_due`
- `created_by`
- `created_at`
- `updated_at`

`invoice_line_items`:
- `id`
- `tenant_id`
- `invoice_id`
- `service_catalog_item_id`
- `description`
- `quantity`
- `unit_price`
- `discount_amount`
- `tax_amount`
- `line_total`

`payments`:
- `id`
- `tenant_id`
- `invoice_id`
- `payment_method`
- `amount`
- `reference_number`
- `status`
- `received_by`
- `received_at`

`billing_adjustments`:
- `id`
- `tenant_id`
- `invoice_id`
- `adjustment_type`
- `amount`
- `reason`
- `approved_by`
- `created_at`

## Invoice Statuses
- `draft`
- `issued`
- `partially_paid`
- `paid`
- `credit_approved`
- `refunded`
- `void`
- `written_off`

## Billing Workflow
1. Visit is created.
2. Staff selects service catalog items.
3. Invoice draft is created.
4. Staff applies discount if authorized.
5. Invoice is issued.
6. Payment is recorded or credit is approved.
7. Workflow moves visit to upload or processing step.
8. Billing analytics receives event.

## Payment Controls
Payment recording should capture:
- Method.
- Amount.
- Reference.
- Collector.
- Time.
- Invoice state before and after.

Payment methods:
- `cash`
- `card`
- `upi`
- `bank_transfer`
- `insurance`
- `partner_credit`
- `other`

## API Endpoints
- `GET /billing/service-catalog`
- `POST /billing/service-catalog`
- `PATCH /billing/service-catalog/{item_id}`
- `POST /billing/invoices`
- `GET /billing/invoices`
- `GET /billing/invoices/{invoice_id}`
- `PATCH /billing/invoices/{invoice_id}`
- `POST /billing/invoices/{invoice_id}/issue`
- `POST /billing/invoices/{invoice_id}/payments`
- `POST /billing/invoices/{invoice_id}/adjustments`
- `POST /billing/invoices/{invoice_id}/void`

## Events
- `billing.invoice_created`
- `billing.invoice_issued`
- `billing.payment_recorded`
- `billing.invoice_paid`
- `billing.adjustment_created`
- `billing.invoice_voided`
- `billing.credit_approved`

## Permissions
- `billing.read`: Staff, Hospital Admin.
- `billing.create_invoice`: Staff.
- `billing.apply_discount`: Staff up to limit, Hospital Admin for higher limit.
- `billing.record_payment`: Staff.
- `billing.void_invoice`: Hospital Admin.
- `billing.export`: Hospital Admin.

## UI Requirements
Screens:
- Billing desk.
- Visit invoice panel.
- Payment capture modal.
- Service catalog management.
- Revenue dashboard.

UX priorities:
- Fast line item selection.
- Clear balance due.
- Visible visit workflow impact.
- Strong audit on discounts and voids.

## Integration with Workflow
Billing events should trigger workflow transitions:
- Invoice issued: move to awaiting payment.
- Payment complete: move to upload pending.
- Credit approved: move to upload pending.
- Invoice void: pause workflow or require admin action.

## Failure and Edge Cases
- Partial payment: keep balance and configurable workflow behavior.
- Overpayment: record credit or refund state.
- Invoice created for wrong visit: void and recreate, do not silently edit history after issue.
- Payment gateway failure: keep pending status.
- Partner credit exceeded: block or require admin approval.

## Implementation Tasks
- Create billing tables.
- Implement invoice number generation per tenant.
- Implement totals calculation service.
- Implement payment recording.
- Implement adjustment approval rules.
- Integrate billing events with workflow.
- Build billing UI.
- Add tests for totals, permissions, and void behavior.

## Acceptance Criteria
- Staff can create invoice for visit.
- Payment changes invoice status correctly.
- Paid or credit-approved invoice can move visit forward.
- Discounts and voids are audited.
- Patient billing data is tenant-isolated.

## LLM Implementation Notes
Tell implementation agents to build deterministic billing calculations with tests. Avoid AI in billing decisions until clean billing workflows exist.

