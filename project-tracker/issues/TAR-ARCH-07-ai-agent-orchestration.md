# TAR-ARCH-07 - AI Agent Orchestration

Status: Later
Type: Architecture Module Issue
Epic: `TAR-EPIC-07` AI Agent Orchestration
Priority: P2
Source: `../../docs/tarini-v6-architecture/07_AI_AGENT_ORCHESTRATION.md`

## Goal
Coordinate Risk, Imaging, Workflow, Prediction, Operations, Documentation, Follow-up, and Coordinator agents with controlled tools, auditable outputs, and safety gates.

## Functional Scope
- Agent task and output records.
- Coordinator routing and task types.
- Tool access rules per agent.
- Structured AI output contracts.
- Safety checks and prompt-injection defenses.
- Events that connect AI outputs to workflow, risk, and copilot.

## Backing Tasks
- [ ] `TAR-ARCH-07-A` Define agent registry and task schema.
- [ ] `TAR-ARCH-07-B` Implement coordinator routing contract.
- [ ] `TAR-ARCH-07-C` Implement structured agent output validation.
- [ ] `TAR-ARCH-07-D` Add agent audit log and model version capture.
- [ ] `TAR-ARCH-07-E` Add prompt-injection and tool-access tests.

## Implementation Notes
- This epic intentionally waits until memory, reports, risk, and workflow APIs exist.
- Agents should not write clinical decisions directly.
- Every agent output must include sources, uncertainty, model version, and recommended human review path.
- Tool permissions should be allowlisted by agent type.

## Acceptance Checks
- Coordinator can create a typed agent task.
- Agent outputs fail validation if citations or required fields are missing.
- Tool access is blocked when an agent requests an unauthorized capability.
- Every AI output is auditable and reversible from workflow impact.

## LLM Handoff
```text
Read 07_AI_AGENT_ORCHESTRATION.md. Before implementing, verify dependent APIs exist. Build schema and validation before model calls. Treat all outputs as assistive.
```
