# Clinical Memory Engine Architecture

## Product Purpose
The Clinical Memory Engine stores and retrieves longitudinal patient context. It helps doctors and AI agents understand the patient's history, prior reports, interventions, follow-ups, outcomes, and similar cases.

This is not just chat memory. It is structured, traceable, tenant-scoped clinical context.

## Users
- Doctor: sees patient history and similar cases.
- Copilot: uses retrieved context to answer questions.
- Risk Agent: uses prior timeline and outcomes.
- Follow-up Agent: uses historical adherence and missed visits.
- Analytics Engine: uses aggregated, de-identified trends.

## In Scope
- Patient timeline memory.
- Report text chunking and embeddings.
- Similar case retrieval.
- Source-linked context assembly.
- AI memory snapshots.
- Outcome-linked memory.
- Retrieval audit logs.

## Out of Scope for MVP
- Unbounded conversational memory.
- Cross-tenant retrieval using identifiable data.
- Automatic clinical conclusions without source references.
- Production model retraining from memory without governance.

## Memory Types
Use multiple memory classes:
- `patient_longitudinal_memory`: patient-specific timeline and clinical facts.
- `report_memory`: extracted text and structured observations from reports.
- `doctor_action_memory`: decisions, notes, overrides, follow-ups.
- `outcome_memory`: downstream outcomes and completion status.
- `similar_case_memory`: de-identified retrieval corpus for pattern matching.
- `operational_memory`: workflow delays, escalations, SLA history.

## Core Entities
`ai_memory_items`:
- `id`
- `tenant_id`
- `patient_id`
- `visit_id`
- `source_type`
- `source_id`
- `memory_type`
- `title`
- `content`
- `structured_payload`
- `embedding_id`
- `sensitivity_level`
- `created_at`

`ai_memory_embeddings`:
- `id`
- `tenant_id`
- `memory_item_id`
- `embedding_model`
- `embedding_vector`
- `embedding_created_at`

`memory_retrieval_logs`:
- `id`
- `tenant_id`
- `actor_id`
- `patient_id`
- `query_text`
- `retrieval_type`
- `result_ids`
- `model_or_algorithm`
- `created_at`

## Memory Ingestion Workflow
1. Source event occurs: report parsed, doctor note created, follow-up completed, outcome recorded.
2. Memory service validates tenant and source.
3. Service creates normalized memory item.
4. Text is chunked if needed.
5. Embedding job runs.
6. Memory item becomes retrievable.
7. Timeline and AI context APIs can reference it.

## Retrieval Workflow
1. Caller requests context for patient, visit, or question.
2. Service checks permissions and tenant.
3. Query is classified: patient context, similar cases, prior reports, workflow context.
4. Structured filters are applied first.
5. Vector search is applied second when needed.
6. Results are ranked by relevance, recency, source reliability, and sensitivity.
7. Context package is returned with source references.
8. Retrieval is logged.

## Context Package Format
```json
{
  "patient_id": "pat_...",
  "visit_id": "vis_...",
  "context_summary": "Short factual summary generated from sources.",
  "items": [
    {
      "memory_item_id": "mem_...",
      "source_type": "report",
      "source_id": "rep_...",
      "title": "CBC Report",
      "snippet": "Hemoglobin value...",
      "relevance_score": 0.91,
      "created_at": "2026-05-22T10:00:00Z"
    }
  ],
  "warnings": ["Some older reports are missing structured lab values."]
}
```

## Similar Case Retrieval
Similar cases must be handled carefully.

Rules:
- Default to same-tenant retrieval.
- Cross-tenant retrieval requires de-identification and explicit product policy.
- Similar case results must not be treated as diagnosis.
- Show why a case is similar: age band, modality, lab pattern, symptoms, progression, outcome.
- Hide direct identifiers unless same patient and authorized.

Similarity inputs:
- Age band.
- Sex where clinically relevant.
- Modality.
- Structured observations.
- Risk factors.
- Report language.
- Outcome labels.
- Timeline shape.

## API Endpoints
- `POST /memory/ingest`
- `GET /patients/{patient_id}/memory`
- `GET /visits/{visit_id}/context`
- `POST /memory/retrieve`
- `POST /memory/similar-cases`
- `GET /memory/items/{memory_item_id}`
- `GET /memory/retrieval-logs`

## Events
- `memory.ingestion_requested`
- `memory.item_created`
- `memory.embedding_created`
- `memory.retrieved`
- `memory.retrieval_failed`

## Permissions
- `memory.read_patient`: Doctor and authorized clinical staff.
- `memory.read_similar_cases`: Doctor and authorized AI services.
- `memory.ingest`: internal services.
- `memory.audit_read`: Hospital Admin or compliance role.

## AI Safety Requirements
- Retrieval outputs must include source links.
- Generated summaries must distinguish facts from inferences.
- Missing data must be stated explicitly.
- Copilot must cite memory items when answering clinical questions.
- Similar cases must be described as historical references, not recommendations.

## Failure and Edge Cases
- Embedding generation fails: memory remains available for structured lookup.
- Duplicate memory item: use source type and source ID idempotency.
- Patient merge: memory items must remap through audited merge workflow.
- Report deleted or restricted: memory references must respect current access.
- Conflicting memory: surface conflict rather than silently choosing one.

## Implementation Tasks
- Create memory tables and vector index.
- Implement source-to-memory normalization.
- Implement chunking and embedding job.
- Implement context assembly service.
- Implement similar case search with filters.
- Add retrieval audit logs.
- Add tests for tenant isolation and source visibility.

## Acceptance Criteria
- A report can be ingested into memory after parsing.
- Doctor can retrieve patient context with source references.
- Copilot can request visit context safely.
- Similar case retrieval returns de-identified and explainable results.
- Retrieval logs are created for AI and user requests.

## LLM Implementation Notes
Tell LLM agents to build memory as a retrieval service with source IDs, not as opaque chat history. Context must always be explainable back to stored records.

