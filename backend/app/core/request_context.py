from dataclasses import dataclass, field, replace

from fastapi import Request


@dataclass(frozen=True)
class RequestContext:
    request_id: str
    correlation_id: str
    tenant_id: str | None = None
    site_id: str | None = None
    actor_id: str | None = None
    actor_role: str | None = None
    permissions: tuple[str, ...] = field(default_factory=tuple)

    @property
    def is_authenticated(self) -> bool:
        return self.actor_id is not None

    def with_identity(
        self,
        *,
        actor_id: str,
        tenant_id: str | None,
        site_id: str | None,
        actor_role: str | None,
        permissions: tuple[str, ...],
    ) -> "RequestContext":
        return replace(
            self,
            actor_id=actor_id,
            tenant_id=tenant_id,
            site_id=site_id,
            actor_role=actor_role,
            permissions=permissions,
        )


def get_request_context(request: Request) -> RequestContext:
    context = getattr(request.state, "request_context", None)
    if not isinstance(context, RequestContext):
        raise RuntimeError("Request context is unavailable")
    return context
