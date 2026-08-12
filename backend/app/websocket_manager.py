"""
websocket_manager.py — ConnectionManager for broadcasting real-time events.

Design:
- Maintained as a module-level singleton (instantiated once, imported in main.py).
- `broadcast` JSON-serializes the message dict and prunes dead connections on
  send failure, so a disconnected browser tab never blocks other clients.
- Thread-safety: FastAPI runs in a single event loop; no additional locking
  is needed for the in-memory list in async context.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import WebSocket
from starlette.websockets import WebSocketState

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages a pool of active WebSocket connections and broadcasts events."""

    def __init__(self) -> None:
        self._active: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        """Accept and register a new WebSocket connection."""
        await ws.accept()
        self._active.append(ws)
        logger.info("WS connected — total active: %d", len(self._active))

    def disconnect(self, ws: WebSocket) -> None:
        """Remove a WebSocket connection from the pool (idempotent)."""
        try:
            self._active.remove(ws)
        except ValueError:
            pass  # Already removed (e.g. double-close)
        logger.info("WS disconnected — total active: %d", len(self._active))

    async def broadcast(self, message: dict[str, Any]) -> None:
        """
        Serialize `message` as JSON and send to all active connections.

        Connections that fail to receive (e.g. browser tab closed mid-send)
        are silently pruned — they do not block the broadcast for other clients.
        """
        payload = json.dumps(message, default=str)  # default=str handles datetime serialisation
        dead: list[WebSocket] = []

        for ws in list(self._active):  # Iterate a copy to allow mutation
            try:
                if ws.client_state == WebSocketState.CONNECTED:
                    await ws.send_text(payload)
                else:
                    dead.append(ws)
            except Exception as exc:
                logger.warning("WS send failed (%s) — pruning connection.", exc)
                dead.append(ws)

        for ws in dead:
            self.disconnect(ws)

    @property
    def active_count(self) -> int:
        return len(self._active)


# Module-level singleton — import and use this in main.py
manager = ConnectionManager()
