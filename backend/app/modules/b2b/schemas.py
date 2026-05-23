from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class B2BPartnerItem(BaseModel):
    id: str
    name: str
    status: str
    tier: str
    contact_email: str


class B2BPartnersResponse(BaseModel):
    items: list[B2BPartnerItem]
    page: PageMeta


class B2BPricingRuleItem(BaseModel):
    id: str
    partner_id: str
    rule_name: str
    status: str
    price_list: str
    discount_percent: float = Field(ge=0)


class B2BPricingRulesResponse(BaseModel):
    items: list[B2BPricingRuleItem]
    page: PageMeta


class B2BOrderItem(BaseModel):
    id: str
    partner_id: str
    po_number: str
    status: str
    total_amount: float = Field(ge=0)
    currency: str
    created_at: str


class B2BCreateOrderRequest(BaseModel):
    partner_id: str
    po_number: str
    status: str
    total_amount: float = Field(ge=0)
    currency: str


class B2BOrdersResponse(BaseModel):
    items: list[B2BOrderItem]
    page: PageMeta


class B2BBillingSummaryItem(BaseModel):
    id: str
    partner_id: str
    invoice_number: str
    status: str
    amount_due: float = Field(ge=0)
    currency: str
    due_date: str


class B2BBillingSummaryResponse(BaseModel):
    items: list[B2BBillingSummaryItem]
    page: PageMeta
