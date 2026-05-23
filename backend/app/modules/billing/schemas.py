from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class ServiceCatalogItem(BaseModel):
    id: str
    code: str
    name: str
    department: str
    base_price: float = Field(ge=0)
    currency: str
    status: str


class ServiceCatalogResponse(BaseModel):
    items: list[ServiceCatalogItem]
    page: PageMeta


class CreateBillingOrderRequest(BaseModel):
    patient_id: str = Field(min_length=3, max_length=64)
    visit_id: str = Field(min_length=3, max_length=64)
    service_id: str = Field(min_length=3, max_length=64)
    quantity: int = Field(default=1, ge=1, le=100)
    discount_percent: float = Field(default=0, ge=0, le=100)
    package_name: str | None = Field(default=None, max_length=120)


class BillingOrderItem(BaseModel):
    id: str
    patient_id: str
    visit_id: str
    service_id: str
    quantity: int = Field(ge=1)
    discount_percent: float = Field(ge=0, le=100)
    package_name: str | None = None
    status: str
    total_amount: float = Field(ge=0)
    currency: str
    created_at: str


class BillingOrdersResponse(BaseModel):
    items: list[BillingOrderItem]
    page: PageMeta


class InvoiceLineItem(BaseModel):
    id: str
    service_name: str
    quantity: int = Field(ge=1)
    unit_price: float = Field(ge=0)
    discount_percent: float = Field(ge=0, le=100)
    line_total: float = Field(ge=0)


class InvoiceItem(BaseModel):
    id: str
    order_id: str
    patient_id: str
    status: str
    subtotal_amount: float = Field(ge=0)
    discount_amount: float = Field(ge=0)
    total_amount: float = Field(ge=0)
    currency: str
    lines: list[InvoiceLineItem]
    created_at: str


class InvoicesResponse(BaseModel):
    items: list[InvoiceItem]
    page: PageMeta


class RecordPaymentRequest(BaseModel):
    invoice_id: str = Field(min_length=3, max_length=64)
    amount: float = Field(gt=0)
    method: str = Field(min_length=2, max_length=32)


class PaymentItem(BaseModel):
    id: str
    invoice_id: str
    amount: float = Field(gt=0)
    currency: str
    method: str
    status: str
    received_at: str


class PaymentsResponse(BaseModel):
    items: list[PaymentItem]
    page: PageMeta
