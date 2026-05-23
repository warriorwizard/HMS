# TAR-ARCH-04 - Reports and Imaging Pipeline

Status: Ready
Type: Architecture Module Issue
Epic: `TAR-EPIC-04` Reports and Imaging Pipeline
Priority: P0
Source: `../../docs/tarini-v6-architecture/04_REPORTS_IMAGING_PIPELINE.md`

## Goal
Support secure report and image upload, processing, metadata extraction, lifecycle tracking, and downstream AI readiness.

## Functional Scope
- Report and file metadata tables.
- Object storage abstraction.
- Secure upload and signed URL APIs.
- Report status lifecycle.
- PDF text extraction and metadata parsing.
- Duplicate checksum warnings.
- Technician upload and report viewer UI.

## Backing Tasks
- [ ] `TAR-P3-001` Create report, file, metadata, processing-job tables.
- [ ] `TAR-P3-002` Implement object storage abstraction.
- [ ] `TAR-P3-003` Implement secure report upload API.
- [ ] `TAR-P3-004` Implement signed file URL API.
- [ ] `TAR-P3-005` Implement report status lifecycle.
- [ ] `TAR-P3-006` Implement PDF text extraction job.
- [ ] `TAR-P3-007` Implement metadata extraction result storage.
- [ ] `TAR-P3-008` Implement duplicate file checksum warning.
- [ ] `TAR-P3-009` Build technician upload UI.
- [ ] `TAR-P3-010` Build report viewer UI.
- [ ] `TAR-P3-011` Add report processing worker tests.

## Implementation Notes
- File access must be short-lived and permission checked.
- Extracted text should retain source references for memory and copilot citations.
- Failed processing jobs must be retryable and visible.
- Imaging AI can be integrated later; MVP should safely store and route images.

## Acceptance Checks
- A technician can upload a report for a visit.
- The report status moves through upload and processing states.
- Signed URLs expire and cannot cross tenant boundaries.
- Extracted text and metadata can be retrieved by downstream memory ingestion.
- Duplicate file warnings do not block valid clinical workflows.

## LLM Handoff
```text
Read 04_REPORTS_IMAGING_PIPELINE.md and BACKLOG.md Phase 3. Build storage and metadata before AI parsing. Keep PHI-safe logging and signed URL behavior front and center.
```
