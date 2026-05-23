# Reports and Imaging Pipeline Architecture

## Product Purpose
The Reports and Imaging Pipeline handles upload, storage, parsing, metadata extraction, status tracking, AI readiness, and doctor review preparation for clinical documents and images.

This module is the bridge between raw clinical artifacts and intelligence features.

## Users
- Technician: uploads reports and images, fixes metadata, monitors processing.
- Doctor: reviews uploaded artifacts and AI summaries.
- Staff: tracks upload completion and visit readiness.
- Patient: views released reports.
- Hospital Admin: configures allowed formats and workflow rules.

## Supported Inputs
MVP:
- PDF lab reports.
- Image files: JPG, PNG.
- Basic radiology images as files.
- CSV/Excel lab exports if required by pilot.

Future:
- DICOM ingestion.
- HL7/FHIR documents.
- PACS integration.
- Scanner integration.
- OCR for scanned paper reports.

## Core Entities
`reports`:
- `id`
- `tenant_id`
- `patient_id`
- `visit_id`
- `report_type`
- `modality`
- `title`
- `status`
- `uploaded_by`
- `reviewed_by`
- `released_to_patient_at`
- `created_at`
- `updated_at`

`report_files`:
- `id`
- `tenant_id`
- `report_id`
- `storage_bucket`
- `storage_key`
- `file_name`
- `file_mime_type`
- `file_size_bytes`
- `checksum`
- `page_count`
- `image_width`
- `image_height`
- `created_at`

`report_metadata`:
- `id`
- `tenant_id`
- `report_id`
- `extracted_patient_name`
- `extracted_patient_age`
- `extracted_report_date`
- `extracted_doctor_name`
- `extracted_lab_name`
- `structured_values`
- `confidence`
- `needs_human_review`

`report_processing_jobs`:
- `id`
- `tenant_id`
- `report_id`
- `job_type`
- `status`
- `attempt_count`
- `error_code`
- `error_message`
- `started_at`
- `finished_at`

## Report Status Lifecycle
Recommended statuses:
- `uploaded`
- `virus_scan_pending`
- `metadata_pending`
- `ocr_pending`
- `parsing_pending`
- `ai_pending`
- `needs_human_metadata_review`
- `ready_for_doctor_review`
- `doctor_reviewed`
- `released`
- `failed`
- `archived`

## Upload Workflow
1. Technician selects patient and visit.
2. Technician uploads file.
3. Backend validates file type, size, and tenant access.
4. File is written to object storage.
5. Report record and file record are created.
6. Virus scan or safety scan job is queued if configured.
7. Metadata extraction job runs.
8. OCR/parsing job runs where applicable.
9. AI analysis request is queued after parsing succeeds.
10. Visit status updates to `processing` or `ready_for_review`.

## Parsing Strategy
For MVP:
- Extract PDF text where available.
- Use OCR only when PDF text is missing or low quality.
- Store original file and extracted text separately.
- Normalize lab values into structured observations when possible.

Structured observation format:
```json
{
  "name": "Hemoglobin",
  "value": 13.2,
  "unit": "g/dL",
  "reference_range": "12.0-15.5",
  "flag": "normal",
  "observed_at": "2026-05-22T10:00:00Z",
  "source_report_id": "rep_..."
}
```

## Imaging Strategy
MVP image handling:
- Store original image.
- Generate preview thumbnail.
- Capture metadata: modality, body part, view, dimensions.
- Allow doctor viewing with zoom/pan if feasible.
- Do not claim diagnostic image interpretation until clinically validated.

Future image AI:
- DICOM metadata extraction.
- Study/series/image hierarchy.
- Imaging model integration.
- Radiologist workflow integration.

## API Endpoints
- `POST /reports`
- `GET /reports`
- `GET /reports/{report_id}`
- `PATCH /reports/{report_id}`
- `POST /reports/{report_id}/files`
- `GET /reports/{report_id}/files/{file_id}/signed-url`
- `GET /reports/{report_id}/metadata`
- `PATCH /reports/{report_id}/metadata`
- `POST /reports/{report_id}/process`
- `POST /reports/{report_id}/release`
- `GET /visits/{visit_id}/reports`

## Events
- `report.created`
- `report.uploaded`
- `report.file_stored`
- `report.metadata_extracted`
- `report.ocr_completed`
- `report.parsing_completed`
- `report.ai_ready`
- `report.processing_failed`
- `report.released`

## Permissions
- `report.upload`: Technician, Staff.
- `report.read`: Doctor, Technician, Staff with tenant rules.
- `report.update_metadata`: Technician, Doctor.
- `report.release`: Doctor or authorized Hospital Admin.
- `report.download`: Doctor, Patient if released.
- `report.delete`: Hospital Admin with strict audit.

## AI Readiness Criteria
AI analysis should run only when:
- Report belongs to a valid patient and visit.
- File safety checks passed.
- Text or structured metadata is available.
- Consent policy allows processing.
- Processing was not blocked by human metadata review.

## Failure and Edge Cases
- Wrong patient upload: allow reassignment through audited correction.
- Unsupported file: reject with clear error.
- Large file: use multipart upload.
- OCR confidence low: route to human metadata review.
- AI service unavailable: keep report available for manual review.
- Duplicate upload: detect checksum and warn user.

## Implementation Tasks
- Implement object storage abstraction.
- Create reports, files, metadata, and job tables.
- Implement upload endpoint with validation.
- Implement signed URL endpoint.
- Implement background processing jobs.
- Implement extracted text storage.
- Implement report status transitions.
- Build upload UI and processing status UI.
- Add tests for file permissions and tenant isolation.

## Acceptance Criteria
- Technician can upload a report to a patient visit.
- System stores file securely and returns processing status.
- Report metadata can be corrected by authorized users.
- Doctor can view original file and extracted summary.
- Failed processing does not block manual review.
- Patient can only access released reports.

## LLM Implementation Notes
Implementation agents should build the upload pipeline before AI analysis. Do not wire model calls directly into upload requests; use async jobs and durable status records.

