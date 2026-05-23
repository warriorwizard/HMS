# Tarini V6 Frontend

This folder will contain the Next.js and TypeScript application.

Primary surfaces:
- Login and tenant selection.
- Role-aware app shell.
- Patient and visit management.
- Report upload and viewer.
- Doctor command center.
- Clinical copilot panel.
- Workflow task board.
- Billing desk.
- Analytics and executive dashboards.

Architecture reference:
- `../docs/tarini-v6-architecture/17_FRONTEND_UI_ARCHITECTURE.md`

## Local Run
From this folder:

```powershell
npm install
npm run dev
```

The app will start at:

```text
http://localhost:3000
```

## Current Skeleton
- Next.js App Router setup.
- TypeScript configuration.
- Initial clinical operations workspace at `/`.
- Global CSS foundation for dense operational UI.
- Admin console surfaces:
  - `/admin/tenants`
  - `/admin/users`
  - `/admin/operations`
  - `/admin/configuration`
- CRM surfaces:
  - `/crm`
  - `/crm/campaigns`
  - `/crm/dashboard`
