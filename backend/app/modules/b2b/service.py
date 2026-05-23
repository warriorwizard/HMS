from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.b2b.schemas import (
    B2BBillingSummaryItem,
    B2BCreateOrderRequest,
    B2BOrderItem,
    B2BPartnerItem,
    B2BPricingRuleItem,
)

T = TypeVar("T")

_PARTNERS: tuple[B2BPartnerItem, ...] = (
    B2BPartnerItem(
        id="partner_001",
        name="Alpha Diagnostics Network",
        status="active",
        tier="gold",
        contact_email="sourcing@alpha-diagnostics.example",
    ),
    B2BPartnerItem(
        id="partner_002",
        name="Beacon Bio Supply",
        status="active",
        tier="silver",
        contact_email="ops@beacon-bio.example",
    ),
    B2BPartnerItem(
        id="partner_003",
        name="CarePulse Distributor",
        status="suspended",
        tier="bronze",
        contact_email="support@carepulse.example",
    ),
    B2BPartnerItem(
        id="partner_004",
        name="Delta Regional Purchasing",
        status="active",
        tier="silver",
        contact_email="contracts@delta-regional.example",
    ),
    B2BPartnerItem(
        id="partner_005",
        name="Alpha Care Collective",
        status="active",
        tier="platinum",
        contact_email="procurement@alpha-care.example",
    ),
)

_PRICING_RULES: tuple[B2BPricingRuleItem, ...] = (
    B2BPricingRuleItem(
        id="rule_001",
        partner_id="partner_001",
        rule_name="Alpha Reagent Base Discount",
        status="active",
        price_list="reagents",
        discount_percent=12.5,
    ),
    B2BPricingRuleItem(
        id="rule_002",
        partner_id="partner_001",
        rule_name="Alpha Legacy Contract Discount",
        status="expired",
        price_list="consumables",
        discount_percent=8.0,
    ),
    B2BPricingRuleItem(
        id="rule_003",
        partner_id="partner_002",
        rule_name="Beacon Analyzer Bundle Discount",
        status="active",
        price_list="equipment",
        discount_percent=9.0,
    ),
    B2BPricingRuleItem(
        id="rule_004",
        partner_id="partner_003",
        rule_name="CarePulse Recovery Pricing",
        status="active",
        price_list="diagnostics",
        discount_percent=5.0,
    ),
    B2BPricingRuleItem(
        id="rule_005",
        partner_id="partner_004",
        rule_name="Delta Regional Intro Offer",
        status="draft",
        price_list="consumables",
        discount_percent=6.5,
    ),
    B2BPricingRuleItem(
        id="rule_006",
        partner_id="partner_001",
        rule_name="Alpha Strategic Volume Discount",
        status="active",
        price_list="equipment",
        discount_percent=15.0,
    ),
)

_BASE_ORDERS: tuple[B2BOrderItem, ...] = (
    B2BOrderItem(
        id="ord_001",
        partner_id="partner_001",
        po_number="PO-ALPHA-100",
        status="open",
        total_amount=12500.0,
        currency="USD",
        created_at="2026-05-16T10:15:00Z",
    ),
    B2BOrderItem(
        id="ord_002",
        partner_id="partner_002",
        po_number="PO-BEACON-210",
        status="fulfilled",
        total_amount=9100.0,
        currency="USD",
        created_at="2026-05-17T08:40:00Z",
    ),
    B2BOrderItem(
        id="ord_003",
        partner_id="partner_001",
        po_number="PO-ALPHA-330",
        status="closed",
        total_amount=14400.0,
        currency="USD",
        created_at="2026-05-18T12:05:00Z",
    ),
    B2BOrderItem(
        id="ord_004",
        partner_id="partner_001",
        po_number="PO-ALPHA-450",
        status="open",
        total_amount=7600.0,
        currency="USD",
        created_at="2026-05-19T14:30:00Z",
    ),
    B2BOrderItem(
        id="ord_005",
        partner_id="partner_004",
        po_number="PO-DELTA-520",
        status="open",
        total_amount=6900.0,
        currency="USD",
        created_at="2026-05-20T09:55:00Z",
    ),
)

_BILLING_SUMMARIES: tuple[B2BBillingSummaryItem, ...] = (
    B2BBillingSummaryItem(
        id="bill_001",
        partner_id="partner_001",
        invoice_number="INV-ALPHA-301",
        status="due",
        amount_due=5300.0,
        currency="USD",
        due_date="2026-05-28",
    ),
    B2BBillingSummaryItem(
        id="bill_002",
        partner_id="partner_002",
        invoice_number="INV-BEACON-102",
        status="paid",
        amount_due=0.0,
        currency="USD",
        due_date="2026-05-18",
    ),
    B2BBillingSummaryItem(
        id="bill_003",
        partner_id="partner_001",
        invoice_number="INV-ALPHA-225",
        status="paid",
        amount_due=0.0,
        currency="USD",
        due_date="2026-05-14",
    ),
    B2BBillingSummaryItem(
        id="bill_004",
        partner_id="partner_003",
        invoice_number="INV-CAREPULSE-404",
        status="due",
        amount_due=1800.0,
        currency="USD",
        due_date="2026-05-30",
    ),
    B2BBillingSummaryItem(
        id="bill_005",
        partner_id="partner_001",
        invoice_number="INV-ALPHA-410",
        status="due",
        amount_due=2600.0,
        currency="USD",
        due_date="2026-06-02",
    ),
)

_orders_lock = Lock()
_orders_store: list[B2BOrderItem] = list(_BASE_ORDERS)


def _normalize_tokens(values: Sequence[str]) -> tuple[str, ...]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in values:
        token = value.strip().lower()
        if not token or token in seen:
            continue
        normalized.append(token)
        seen.add(token)
    return tuple(normalized)


def _normalize_token(value: str | None) -> str | None:
    if value is None:
        return None

    token = value.strip().lower()
    return token or None


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    query_lower = query.lower()
    return any(query_lower in value.lower() for value in values)


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def _next_order_id(orders: Sequence[B2BOrderItem]) -> str:
    max_identifier = 0
    for order in orders:
        if not order.id.startswith("ord_"):
            continue
        suffix = order.id.split("_", 1)[1]
        if suffix.isdigit():
            max_identifier = max(max_identifier, int(suffix))
    return f"ord_{max_identifier + 1:03d}"


def reset_b2b_order_store() -> None:
    global _orders_store
    with _orders_lock:
        _orders_store = list(_BASE_ORDERS)


def list_b2b_partners(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[B2BPartnerItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        partner
        for partner in _PARTNERS
        if (
            (not normalized_statuses or partner.status.lower() in normalized_statuses)
            and _matches_query(
                search,
                partner.id,
                partner.name,
                partner.contact_email,
                partner.tier,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_b2b_pricing_rules(
    *,
    pagination: PaginationParams,
    partner_id: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[B2BPricingRuleItem], int]:
    normalized_partner_id = _normalize_token(partner_id)
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        rule
        for rule in _PRICING_RULES
        if (
            (not normalized_partner_id or rule.partner_id.lower() == normalized_partner_id)
            and (not normalized_statuses or rule.status.lower() in normalized_statuses)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_b2b_orders(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    partner_id: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[B2BOrderItem], int]:
    normalized_partner_id = _normalize_token(partner_id)
    normalized_statuses = _normalize_tokens(statuses)
    with _orders_lock:
        orders = tuple(_orders_store)

    filtered = [
        order
        for order in orders
        if (
            (not normalized_partner_id or order.partner_id.lower() == normalized_partner_id)
            and (not normalized_statuses or order.status.lower() in normalized_statuses)
            and _matches_query(
                search,
                order.id,
                order.po_number,
                order.partner_id,
                order.currency,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_b2b_order(payload: B2BCreateOrderRequest) -> B2BOrderItem:
    with _orders_lock:
        order = B2BOrderItem(
            id=_next_order_id(_orders_store),
            partner_id=payload.partner_id,
            po_number=payload.po_number,
            status=payload.status,
            total_amount=payload.total_amount,
            currency=payload.currency,
            created_at="2026-05-23T00:00:00Z",
        )
        _orders_store.append(order)
    return order


def list_b2b_billing_summary(
    *,
    pagination: PaginationParams,
    partner_id: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[B2BBillingSummaryItem], int]:
    normalized_partner_id = _normalize_token(partner_id)
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        summary
        for summary in _BILLING_SUMMARIES
        if (
            (not normalized_partner_id or summary.partner_id.lower() == normalized_partner_id)
            and (not normalized_statuses or summary.status.lower() in normalized_statuses)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total
