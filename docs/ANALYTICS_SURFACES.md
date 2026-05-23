# Analytics Surfaces

This project now exposes the following analytics API surfaces:

- `GET /api/v1/analytics/events`
- `GET /api/v1/analytics/tat-metrics`
- `GET /api/v1/analytics/workflow-bottlenecks`
- `GET /api/v1/analytics/revenue-summary`
- `GET /api/v1/analytics/ai-usage`

The `/analytics` frontend route consumes these endpoints to render:

- Executive KPI cards
- AI usage and doctor-alignment trends
- Workflow bottleneck blocks
- Turnaround-time and revenue summary panels

All analytics list endpoints return the contract:

```json
{
  "items": [],
  "page": {
    "limit": 25,
    "offset": 0,
    "total": 0
  }
}
```
