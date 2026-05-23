# Tarini V6 Issue Cards

This folder contains one Jira-style issue card for each architecture module in `docs/tarini-v6-architecture`.

## How To Work From These Cards
- Open `../JIRA_BOARD.md` to choose the next issue.
- Open the matching `TAR-ARCH-*` issue card.
- Read the source architecture file named on the card.
- Implement only the next backing task from `../BACKLOG.md`.
- Update `../CURRENT_WORK.md` when work starts and when verification finishes.
- Keep original task statuses in `../BACKLOG.md` and `../STATUS_BOARD.md` as the source of truth.

## Issue Card Fields
- `Status`: derived module status, not a replacement for backlog task status.
- `Epic`: product-area parent from `../EPICS.md`.
- `Source`: architecture file that must be read before implementation.
- `Backing Tasks`: small implementation tasks already tracked in `../BACKLOG.md`.
- `Acceptance Checks`: what must be true before the issue can move to done.
- `LLM Handoff`: prompt-like instruction block for focused agent execution.
