from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class NotificationItem(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    channel: str
    status: str
    is_read: bool
    created_at: str
    read_at: str | None = None


class NotificationsResponse(BaseModel):
    items: list[NotificationItem]
    page: PageMeta


class CreateNotificationRequest(BaseModel):
    user_id: str
    title: str
    message: str
    channel: str
    status: str = "queued"
