import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.config import settings
from app.core.logging import request_id_context


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Assigns or propagates a unique correlation ID for each incoming request."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
        token = request_id_context.set(request_id)
        try:
            response: Response = await call_next(request)
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            request_id_context.reset(token)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces essential security headers on all responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
        if settings.ENFORCE_HTTPS or (settings.ENVIRONMENT == "production" and is_https):
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response
