from __future__ import annotations

from collections.abc import Sequence
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.crm.schemas import CRMCampaignItem, CRMLeadItem, CRMReminderItem

T = TypeVar("T")

_LEADS: tuple[CRMLeadItem, ...] = (
    CRMLeadItem(
        id="lead_001",
        full_name="Nora Patel",
        company="Alpha Diagnostics",
        email="nora.patel@alpha.example",
        status="new",
        source="website",
    ),
    CRMLeadItem(
        id="lead_002",
        full_name="Liam Chen",
        company="Beacon Bio",
        email="liam.chen@beacon.example",
        status="contacted",
        source="referral",
    ),
    CRMLeadItem(
        id="lead_003",
        full_name="Maya Singh",
        company="Gamma Care",
        email="maya.singh@gamma.example",
        status="qualified",
        source="conference",
    ),
    CRMLeadItem(
        id="lead_004",
        full_name="Owen Diaz",
        company="Alpha Clinics",
        email="owen.diaz@alpha.example",
        status="qualified",
        source="webinar",
    ),
    CRMLeadItem(
        id="lead_005",
        full_name="Riya Shah",
        company="Delta Labs",
        email="riya.shah@delta.example",
        status="lost",
        source="cold-call",
    ),
)

_REMINDERS: tuple[CRMReminderItem, ...] = (
    CRMReminderItem(
        id="rem_001",
        lead_id="lead_001",
        title="Call Nora about onboarding demo",
        due_date="2026-05-20",
        priority="high",
        status="pending",
    ),
    CRMReminderItem(
        id="rem_002",
        lead_id="lead_002",
        title="Share pricing sheet with Liam",
        due_date="2026-05-21",
        priority="medium",
        status="completed",
    ),
    CRMReminderItem(
        id="rem_003",
        lead_id="lead_003",
        title="Schedule technical validation",
        due_date="2026-05-22",
        priority="high",
        status="pending",
    ),
    CRMReminderItem(
        id="rem_004",
        lead_id="lead_004",
        title="Follow up after webinar",
        due_date="2026-05-23",
        priority="low",
        status="cancelled",
    ),
    CRMReminderItem(
        id="rem_005",
        lead_id="lead_005",
        title="Re-engagement message",
        due_date="2026-05-24",
        priority="high",
        status="completed",
    ),
)

_CAMPAIGNS: tuple[CRMCampaignItem, ...] = (
    CRMCampaignItem(
        id="camp_001",
        name="Alpha Spring Outreach",
        channel="email",
        status="active",
        audience="new-leads",
    ),
    CRMCampaignItem(
        id="camp_002",
        name="Referral Push Q2",
        channel="sms",
        status="draft",
        audience="existing-customers",
    ),
    CRMCampaignItem(
        id="camp_003",
        name="Alpha Re-engagement",
        channel="email",
        status="paused",
        audience="stale-leads",
    ),
    CRMCampaignItem(
        id="camp_004",
        name="Wellness Webinar",
        channel="social",
        status="active",
        audience="general-public",
    ),
    CRMCampaignItem(
        id="camp_005",
        name="Alpha Partner Nurture",
        channel="whatsapp",
        status="active",
        audience="partners",
    ),
    CRMCampaignItem(
        id="camp_006",
        name="Alpha Email Winback",
        channel="email",
        status="active",
        audience="stale-leads",
    ),
)


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


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    query_lower = query.lower()
    return any(query_lower in value.lower() for value in values)


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def list_crm_leads(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[CRMLeadItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        lead
        for lead in _LEADS
        if (
            (not normalized_statuses or lead.status.lower() in normalized_statuses)
            and _matches_query(
                search,
                lead.id,
                lead.full_name,
                lead.company,
                lead.email,
                lead.source,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_crm_reminders(
    *,
    pagination: PaginationParams,
    priorities: Sequence[str] = (),
    statuses: Sequence[str] = (),
) -> tuple[list[CRMReminderItem], int]:
    normalized_priorities = _normalize_tokens(priorities)
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        reminder
        for reminder in _REMINDERS
        if (
            (not normalized_priorities or reminder.priority.lower() in normalized_priorities)
            and (not normalized_statuses or reminder.status.lower() in normalized_statuses)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_crm_campaigns(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
    channels: Sequence[str] = (),
) -> tuple[list[CRMCampaignItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_channels = _normalize_tokens(channels)
    filtered = [
        campaign
        for campaign in _CAMPAIGNS
        if (
            (not normalized_statuses or campaign.status.lower() in normalized_statuses)
            and (not normalized_channels or campaign.channel.lower() in normalized_channels)
            and _matches_query(
                search,
                campaign.id,
                campaign.name,
                campaign.audience,
                campaign.channel,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total
