from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.billing.schemas import (
    BillingOrderItem,
    CreateBillingOrderRequest,
    InvoiceItem,
    InvoiceLineItem,
    PaymentItem,
    RecordPaymentRequest,
    ServiceCatalogItem,
)

T = TypeVar("T")

_SERVICES: tuple[ServiceCatalogItem, ...] = (
    ServiceCatalogItem(
        id="svc_001",
        code="RAD-CT-ABDO",
        name="CT Abdomen",
        department="radiology",
        base_price=220.0,
        currency="USD",
        status="active",
    ),
    ServiceCatalogItem(
        id="svc_002",
        code="LAB-CBC",
        name="Complete Blood Count",
        department="pathology",
        base_price=36.0,
        currency="USD",
        status="active",
    ),
    ServiceCatalogItem(
        id="svc_003",
        code="RAD-XR-CHEST",
        name="Chest X-Ray",
        department="radiology",
        base_price=55.0,
        currency="USD",
        status="active",
    ),
)

_ORDERS: list[BillingOrderItem] = [
    BillingOrderItem(
        id="ord_101",
        patient_id="pat_001",
        visit_id="vis_001",
        service_id="svc_003",
        quantity=1,
        discount_percent=0,
        package_name=None,
        status="invoiced",
        total_amount=55.0,
        currency="USD",
        created_at="2026-05-23T08:20:00Z",
    )
]

_INVOICES: list[InvoiceItem] = [
    InvoiceItem(
        id="inv_101",
        order_id="ord_101",
        patient_id="pat_001",
        status="paid",
        subtotal_amount=55.0,
        discount_amount=0.0,
        total_amount=55.0,
        currency="USD",
        lines=[
            InvoiceLineItem(
                id="line_101",
                service_name="Chest X-Ray",
                quantity=1,
                unit_price=55.0,
                discount_percent=0.0,
                line_total=55.0,
            )
        ],
        created_at="2026-05-23T08:22:00Z",
    )
]

_PAYMENTS: list[PaymentItem] = [
    PaymentItem(
        id="pay_101",
        invoice_id="inv_101",
        amount=55.0,
        currency="USD",
        method="upi",
        status="settled",
        received_at="2026-05-23T08:30:00Z",
    )
]

_next_order_id = 102
_next_invoice_id = 102
_next_line_id = 102
_next_payment_id = 102
_lock = Lock()


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


def _matches_exact_token(filters: tuple[str, ...], value: str) -> bool:
    if not filters:
        return True
    return value.lower() in filters


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    token = query.lower()
    return any(token in value.lower() for value in values)


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def list_service_catalog(
    *,
    pagination: PaginationParams,
    statuses: Sequence[str] = (),
    departments: Sequence[str] = (),
) -> tuple[list[ServiceCatalogItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_departments = _normalize_tokens(departments)
    filtered = [
        item
        for item in _SERVICES
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_exact_token(normalized_departments, item.department)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_orders(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[BillingOrderItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        item
        for item in _ORDERS
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_query(
                search,
                item.id,
                item.patient_id,
                item.visit_id,
                item.service_id,
                item.status,
                item.package_name or "",
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_order(payload: CreateBillingOrderRequest) -> BillingOrderItem:
    global _next_order_id, _next_invoice_id, _next_line_id

    service = next((entry for entry in _SERVICES if entry.id == payload.service_id), None)
    if service is None:
        raise ValueError("Service not found")

    subtotal = service.base_price * payload.quantity
    discount_amount = subtotal * (payload.discount_percent / 100.0)
    total = round(subtotal - discount_amount, 2)

    with _lock:
        order_id = f"ord_{_next_order_id}"
        invoice_id = f"inv_{_next_invoice_id}"
        line_id = f"line_{_next_line_id}"

        order = BillingOrderItem(
            id=order_id,
            patient_id=payload.patient_id,
            visit_id=payload.visit_id,
            service_id=payload.service_id,
            quantity=payload.quantity,
            discount_percent=payload.discount_percent,
            package_name=payload.package_name,
            status="invoiced",
            total_amount=total,
            currency=service.currency,
            created_at="2026-05-23T12:00:00Z",
        )
        invoice = InvoiceItem(
            id=invoice_id,
            order_id=order_id,
            patient_id=payload.patient_id,
            status="unpaid",
            subtotal_amount=round(subtotal, 2),
            discount_amount=round(discount_amount, 2),
            total_amount=total,
            currency=service.currency,
            lines=[
                InvoiceLineItem(
                    id=line_id,
                    service_name=service.name,
                    quantity=payload.quantity,
                    unit_price=service.base_price,
                    discount_percent=payload.discount_percent,
                    line_total=total,
                )
            ],
            created_at="2026-05-23T12:00:00Z",
        )

        _ORDERS.append(order)
        _INVOICES.append(invoice)

        _next_order_id += 1
        _next_invoice_id += 1
        _next_line_id += 1

    return order


def list_invoices(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[InvoiceItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        item
        for item in _INVOICES
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_query(search, item.id, item.order_id, item.patient_id, item.status)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_payments(
    *,
    pagination: PaginationParams,
    statuses: Sequence[str] = (),
    methods: Sequence[str] = (),
) -> tuple[list[PaymentItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_methods = _normalize_tokens(methods)
    filtered = [
        item
        for item in _PAYMENTS
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_exact_token(normalized_methods, item.method)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def record_payment(payload: RecordPaymentRequest) -> PaymentItem:
    global _next_payment_id

    invoice = next((item for item in _INVOICES if item.id == payload.invoice_id), None)
    if invoice is None:
        raise ValueError("Invoice not found")

    with _lock:
        payment = PaymentItem(
            id=f"pay_{_next_payment_id}",
            invoice_id=payload.invoice_id,
            amount=payload.amount,
            currency=invoice.currency,
            method=payload.method.strip().lower(),
            status="settled",
            received_at="2026-05-23T12:00:00Z",
        )
        _PAYMENTS.append(payment)
        _next_payment_id += 1

        paid_amount = sum(item.amount for item in _PAYMENTS if item.invoice_id == payload.invoice_id)
        next_status = "paid" if paid_amount >= invoice.total_amount else "partial"
        index = _INVOICES.index(invoice)
        _INVOICES[index] = invoice.model_copy(update={"status": next_status})

    return payment
