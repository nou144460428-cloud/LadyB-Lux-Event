# Operations Runbook

## Daily backup (recommended)

Run daily at 01:00:

```bash
0 1 * * * cd /home/skyetech/ladyB-lux-event && DATABASE_URL="postgresql://..." ./ops/backup/backup-postgres.sh >> /var/log/ladyb-backup.log 2>&1
```

## Restore drill (weekly)

1. Pick latest backup file from `./backups`.
2. Restore into a staging database:

```bash
DATABASE_URL="postgresql://..." ./ops/backup/restore-postgres.sh ./backups/ladyb_lux_event_YYYYMMDD_HHMMSS.sql.gz
```

3. Validate key records:
4. Start backend against restored DB.
5. Verify login, events, orders, and payment records.

## Payment reconciliation

- Automatic: every 10 minutes (cron in `backend/src/main.ts`).
- Manual trigger (admin):

```http
POST /admin/payments/reconcile
Authorization: Bearer <admin-token>
```

## Event media management

- Public listing:
  - `GET /event-media`
- Admin CRUD:
  - `POST /event-media/admin`
  - `PATCH /event-media/admin/:id`
  - `DELETE /event-media/admin/:id`

## One-time admin bootstrap

If no admin exists, call:

```http
POST /auth/admin/bootstrap
{
  "name": "Owner",
  "email": "admin@domain.com",
  "password": "securepass",
  "bootstrapSecret": "<ADMIN_BOOTSTRAP_SECRET>"
}
```
